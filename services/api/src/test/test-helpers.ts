import { env, exports } from 'cloudflare:workers';
import { currentTotpCode } from '../lib/totp';

const BASE_URL = 'https://example.com';

export type Cookies = Record<string, string>;

const parseSetCookies = (response: Response): Cookies => {
	const cookies: Cookies = {};
	for (const raw of response.headers.getSetCookie()) {
		const pair = raw.split(';', 1)[0] ?? '';
		const eq = pair.indexOf('=');
		if (eq === -1) continue;
		cookies[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
	}
	return cookies;
};

const cookieHeader = (cookies: Cookies): string =>
	Object.entries(cookies)
		.map(([name, value]) => `${name}=${value}`)
		.join('; ');

export type CallResult<T = unknown> = {
	response: Response;
	status: number;
	body: T;
	/** This call's cookies merged with any newly-set ones -- pass straight into the next `callApp`. */
	cookies: Cookies;
};

/**
 * Calls the real Worker (`exports.default.fetch`, not a mocked handler) for one request. Threads
 * cookies manually (there's no browser cookie jar here) and lets `ip` stand in for the
 * `cf-connecting-ip` header the IP rate limiter keys on.
 */
export const callApp = async <T = unknown>(
	path: string,
	init: Omit<RequestInit, 'headers'> & {
		cookies?: Cookies;
		ip?: string;
		headers?: HeadersInit;
	} = {}
): Promise<CallResult<T>> => {
	const { cookies = {}, ip, headers, ...rest } = init;
	const finalHeaders = new Headers(headers);
	const cookieValue = cookieHeader(cookies);
	if (cookieValue) finalHeaders.set('Cookie', cookieValue);
	if (ip) finalHeaders.set('cf-connecting-ip', ip);

	const response = await exports.default.fetch(`${BASE_URL}${path}`, {
		...rest,
		headers: finalHeaders,
	});
	const body = (await response
		.clone()
		.json()
		.catch(() => null)) as T;

	return {
		response,
		status: response.status,
		body,
		cookies: { ...cookies, ...parseSetCookies(response) },
	};
};

let ipCounter = 0;
/** A fresh IP per call -- `/register`/`/forgot-password`/`/resend-verification` are IP rate-limited
 * (5 per 15 min), so helpers default to a distinct IP each time, matching distinct real users.
 * Tests exercising the limiter itself pass the same `ip` on purpose instead. */
export const uniqueIp = (): string => {
	ipCounter += 1;
	return `10.${(ipCounter >> 16) & 0xff}.${(ipCounter >> 8) & 0xff}.${ipCounter & 0xff}`;
};

let userCounter = 0;
/** Always valid against UsernameSchema (alnum/underscore/hyphen, 3-30 chars) regardless of what a
 * call site's `uniqueEmail()` prefix looks like. */
const uniqueUsername = (): string => `e2euser${Date.now()}${userCounter++}`;

const jsonInit = (
	body: unknown,
	cookies: Cookies,
	extraHeaders: HeadersInit = {}
) => ({
	method: 'POST' as const,
	headers: { 'Content-Type': 'application/json', ...extraHeaders },
	body: JSON.stringify(body),
	cookies,
});

/** Seeds a fresh CSRF cookie -- every mutating `/api/*` call needs one, same as a real browser
 * fetching `GET /api/auth/csrf-token` before its first form submit. */
export const getCsrfToken = async (
	cookies: Cookies = {}
): Promise<{ csrfToken: string; cookies: Cookies }> => {
	const result = await callApp<{ csrfToken: string }>('/api/auth/csrf-token', {
		cookies,
	});
	return { csrfToken: result.body.csrfToken, cookies: result.cookies };
};

/** POST with CSRF pre-seeded -- the common case for every mutating call in these tests. */
export const postJson = async <T = unknown>(
	path: string,
	body: unknown,
	cookies: Cookies = {},
	opts: { ip?: string; method?: 'POST' | 'PATCH' | 'DELETE' } = {}
): Promise<CallResult<T>> => {
	const seeded = await getCsrfToken(cookies);
	return callApp<T>(path, {
		...jsonInit(body, seeded.cookies, { 'x-csrf-token': seeded.csrfToken }),
		method: opts.method ?? 'POST',
		ip: opts.ip,
	});
};

export const registerUser = async (
	email: string,
	password: string,
	ip: string = uniqueIp()
): Promise<{ userId: string; username: string; cookies: Cookies }> => {
	const username = uniqueUsername();
	const result = await postJson<{
		data: { id: string; username: string; email: string };
	}>('/api/auth/register', { username, email, password }, {}, { ip });
	if (result.status !== 201) {
		throw new Error(
			`registerUser failed: ${result.status} ${JSON.stringify(result.body)}`
		);
	}
	return { userId: result.body.data.id, username, cookies: result.cookies };
};

/** Reads the pending token straight from D1 -- there's no fake inbox, so DB inspection is the only
 * way to get a real token (see src/lib/email.ts's "unconfigured is a valid state" behavior). */
export const getLatestAuthToken = async (
	userId: string,
	purpose: 'verify_email' | 'password_reset' | 'change_email'
): Promise<string> => {
	const row = await env.DB.prepare(
		'SELECT id FROM auth_tokens WHERE user_id = ?1 AND purpose = ?2 ORDER BY created_at DESC LIMIT 1'
	)
		.bind(userId, purpose)
		.first<{ id: string }>();
	if (!row) throw new Error(`No ${purpose} token found for user ${userId}`);
	return row.id;
};

export const verifyUserEmail = async (
	userId: string,
	cookies: Cookies = {}
): Promise<void> => {
	const token = await getLatestAuthToken(userId, 'verify_email');
	const result = await postJson('/api/auth/verify-email', { token }, cookies);
	if (result.status !== 200) {
		throw new Error(
			`verifyUserEmail failed: ${result.status} ${JSON.stringify(result.body)}`
		);
	}
};

export const registerAndVerify = async (
	email: string,
	password: string
): Promise<{ userId: string; username: string }> => {
	const { userId, username } = await registerUser(email, password);
	await verifyUserEmail(userId);
	return { userId, username };
};

export const loginUser = async (
	email: string,
	password: string,
	totpCode?: string
): Promise<
	CallResult<
		| { data: { id: string; username: string; email: string } }
		| { error: string; details?: string[] }
	>
> => postJson('/api/auth/login', { email, password, totpCode });

/** Direct `UPDATE users SET role = 'admin'` -- matches the real "second admin is a manual DB
 * update" flow; there's no in-app promote button. */
export const promoteToAdmin = async (userId: string): Promise<void> => {
	await env.DB.prepare("UPDATE users SET role = 'admin' WHERE user_id = ?1")
		.bind(userId)
		.run();
};

/** Pairflix models suspension/ban as `users.status`, not a separate timestamp column (see
 * packages/db/src/schema.ts) -- direct DB write, there's no self-service way to reach this state. */
export const suspendDirectly = async (userId: string): Promise<void> => {
	await env.DB.prepare(
		"UPDATE users SET status = 'suspended' WHERE user_id = ?1"
	)
		.bind(userId)
		.run();
};

/** Enrolls and confirms TOTP for whoever `cookies` is logged in as, computing the current code
 * with the same `currentTotpCode` the real login/verify flow checks against. Returns the enrolled
 * secret too, for tests that log in again afterward and need a fresh code. */
export const enrollTotp = async (
	cookies: Cookies
): Promise<{ secret: string; backupCodes: string[]; cookies: Cookies }> => {
	const enroll = await postJson<{
		data: { secret: string; otpauthUrl: string };
	}>('/api/me/2fa/enroll', {}, cookies);
	if (enroll.status !== 200) {
		throw new Error(
			`enrollTotp (enroll) failed: ${enroll.status} ${JSON.stringify(enroll.body)}`
		);
	}
	const secret = enroll.body.data.secret;
	const code = await currentTotpCode(secret);
	const verify = await postJson<{ data: { backupCodes: string[] } }>(
		'/api/me/2fa/verify',
		{ code },
		enroll.cookies
	);
	if (verify.status !== 200) {
		throw new Error(
			`enrollTotp (verify) failed: ${verify.status} ${JSON.stringify(verify.body)}`
		);
	}
	return {
		secret,
		backupCodes: verify.body.data.backupCodes,
		cookies: verify.cookies,
	};
};

/** A fresh, verified, logged-in non-admin user -- the common starting point for most tests. */
export const createLoggedInUser = async (
	email: string,
	password = 'Str0ngPass123'
): Promise<{ userId: string; cookies: Cookies }> => {
	const { userId } = await registerAndVerify(email, password);
	const login = await loginUser(email, password);
	if (login.status !== 200) {
		throw new Error(
			`createLoggedInUser login failed: ${login.status} ${JSON.stringify(login.body)}`
		);
	}
	return { userId, cookies: login.cookies };
};

/** A fresh admin -- verified, promoted, TOTP-enrolled, logged back in with a valid code (see
 * middleware/auth.ts's `requireAdmin`, which demands both). */
export const createLoggedInAdmin = async (
	email: string,
	password = 'Str0ngPass123'
): Promise<{ userId: string; cookies: Cookies; totpSecret: string }> => {
	const { userId } = await registerAndVerify(email, password);
	await promoteToAdmin(userId);
	const firstLogin = await loginUser(email, password);
	if (firstLogin.status !== 200) {
		throw new Error(
			`createLoggedInAdmin first login failed: ${firstLogin.status} ${JSON.stringify(firstLogin.body)}`
		);
	}
	const { secret } = await enrollTotp(firstLogin.cookies);
	const code = await currentTotpCode(secret);
	const secondLogin = await loginUser(email, password, code);
	if (secondLogin.status !== 200) {
		throw new Error(
			`createLoggedInAdmin second login failed: ${secondLogin.status} ${JSON.stringify(secondLogin.body)}`
		);
	}
	return { userId, cookies: secondLogin.cookies, totpSecret: secret };
};
