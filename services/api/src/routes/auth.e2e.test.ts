import { env } from 'cloudflare:workers';
import { describe, expect, it, vi } from 'vitest';
import { FAILED_ATTEMPT_LIMIT } from '../lib/session';
import { currentTotpCode } from '../lib/totp';
import {
	callApp,
	createLoggedInUser,
	enrollTotp,
	getCsrfToken,
	getLatestAuthToken,
	loginUser,
	postJson,
	registerAndVerify,
	registerUser,
	suspendDirectly,
	uniqueIp,
} from '../test/test-helpers';
import { hashToken } from './auth';

let counter = 0;
/** A fresh email per test -- isolated storage resets D1 between test *files*, not between tests
 * within one file, so tests that create accounts need non-colliding addresses. */
const uniqueEmail = () => `auth-e2e-${Date.now()}-${counter++}@example.com`;

const RESET_LINK_TOKEN_PATTERN = /reset-password\?token=([0-9a-f]{64})/;

/** Calls `/forgot-password` and returns the plaintext reset token straight out of the emailed
 * link. `auth_tokens.id` now stores a SHA-256 hash of a `password_reset` token (see routes/auth.ts's
 * `hashToken`), so the plaintext is never recoverable from D1 afterward the way `getLatestAuthToken`
 * reads other purposes -- the unconfigured `RESEND_API_KEY` in this test env (see
 * vitest.config.mts) routes the email through lib/email.ts's dev-fallback `console.warn` instead,
 * which is the only place the plaintext still appears. */
const forgotPasswordAndCaptureToken = async (
	email: string,
	ip: string = uniqueIp()
): Promise<string> => {
	const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	try {
		const result = await postJson(
			'/api/auth/forgot-password',
			{ email },
			{},
			{ ip }
		);
		if (result.status !== 200) {
			throw new Error(`forgot-password failed: ${result.status}`);
		}
		let token: string | undefined;
		for (const call of warnSpy.mock.calls) {
			const match = RESET_LINK_TOKEN_PATTERN.exec(String(call[0]));
			if (match) token = match[1];
		}
		if (!token)
			throw new Error('No reset-password token found in logged email output');
		return token;
	} finally {
		warnSpy.mockRestore();
	}
};

describe('POST /api/auth/register', () => {
	it('creates an unverified account, no session', async () => {
		const email = uniqueEmail();
		const result = await registerUser(email, 'Str0ngPass123');
		expect(result.cookies.session).toBeUndefined();

		const user = await env.DB.prepare(
			'SELECT email_verified, role FROM users WHERE user_id = ?1'
		)
			.bind(result.userId)
			.first<{ email_verified: number; role: string }>();
		expect(user?.email_verified).toBe(0);
		expect(user?.role).toBe('user');
	});

	it('rejects a duplicate email', async () => {
		const email = uniqueEmail();
		await registerUser(email, 'Str0ngPass123');
		const second = await postJson('/api/auth/register', {
			username: `e2edup${Date.now()}`,
			email,
			password: 'AnotherPass123',
		});
		expect(second.status).toBe(409);
	});

	it('rejects a duplicate username', async () => {
		const { username } = await registerUser(uniqueEmail(), 'Str0ngPass123');
		const second = await postJson('/api/auth/register', {
			username,
			email: uniqueEmail(),
			password: 'AnotherPass123',
		});
		expect(second.status).toBe(409);
	});

	// 40 iterations x 2 concurrent registrations (each hashing a password) is meaningfully more
	// work than a typical test in this file -- an explicit timeout gives it headroom on a loaded CI
	// runner instead of trimming the iteration count (and the collision-probability margin it
	// protects, see below).
	it('returns a clean 409, not a 500, when two registrations race for the same email', async () => {
		const register = (
			csrf: { csrfToken: string; cookies: Record<string, string> },
			email: string,
			username: string,
			ip: string
		) =>
			callApp('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-csrf-token': csrf.csrfToken,
				},
				body: JSON.stringify({ username, email, password: 'Str0ngPass123' }),
				cookies: csrf.cookies,
				ip,
			});

		// Whether two truly-concurrent requests actually collide at the DB layer (rather than one
		// fully finishing, insert included, before the other's pre-check SELECT even runs) is
		// timing-dependent -- measured empirically at ~10% of attempts in this harness. 40 fresh-email
		// attempts pushes the chance of never once hitting that overlap down to roughly 1.5%, without
		// changing what's actually asserted: every attempt, raced or not, must resolve to exactly one
		// 201 and one 409, never a 500.
		for (let attempt = 0; attempt < 40; attempt++) {
			const email = uniqueEmail();
			const [csrf1, csrf2] = await Promise.all([
				getCsrfToken(),
				getCsrfToken(),
			]);
			const [first, second] = await Promise.all([
				register(csrf1, email, `e2erace1${Date.now()}${counter++}`, uniqueIp()),
				register(csrf2, email, `e2erace2${Date.now()}${counter++}`, uniqueIp()),
			]);
			const statuses = [first.status, second.status].sort((a, b) => a - b);
			expect(statuses).toEqual([201, 409]);
		}
	}, 30_000);
});

describe('POST /api/auth/verify-email', () => {
	it('verifies with a valid token', async () => {
		const email = uniqueEmail();
		const { userId } = await registerUser(email, 'Str0ngPass123');
		const token = await getLatestAuthToken(userId, 'verify_email');

		const result = await postJson('/api/auth/verify-email', { token });
		expect(result.status).toBe(200);

		const user = await env.DB.prepare(
			'SELECT email_verified FROM users WHERE user_id = ?1'
		)
			.bind(userId)
			.first<{ email_verified: number }>();
		expect(user?.email_verified).toBe(1);
	});

	it('rejects a bad token', async () => {
		const result = await postJson('/api/auth/verify-email', {
			token: 'not-a-real-token',
		});
		expect(result.status).toBe(400);
	});

	it('rejects a reused token', async () => {
		const email = uniqueEmail();
		const { userId } = await registerUser(email, 'Str0ngPass123');
		const token = await getLatestAuthToken(userId, 'verify_email');
		await postJson('/api/auth/verify-email', { token });

		const second = await postJson('/api/auth/verify-email', { token });
		expect(second.status).toBe(400);
	});
});

describe('POST /api/auth/login', () => {
	it('rejects login before the email is verified', async () => {
		const email = uniqueEmail();
		await registerUser(email, 'Str0ngPass123');

		const result = await loginUser(email, 'Str0ngPass123');
		expect(result.status).toBe(403);
	});

	it('does not set last_login for correct credentials blocked by an unverified email', async () => {
		const email = uniqueEmail();
		const { userId } = await registerUser(email, 'Str0ngPass123');

		const result = await loginUser(email, 'Str0ngPass123');
		expect(result.status).toBe(403);

		const user = await env.DB.prepare(
			'SELECT last_login FROM users WHERE user_id = ?1'
		)
			.bind(userId)
			.first<{ last_login: number | null }>();
		expect(user?.last_login).toBeNull();
	});

	it('logs in a verified user, sets a session cookie, and sets last_login', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');

		const result = await loginUser(email, 'Str0ngPass123');
		expect(result.status).toBe(200);
		expect(result.cookies.session).toBeTruthy();

		const user = await env.DB.prepare(
			'SELECT last_login FROM users WHERE user_id = ?1'
		)
			.bind(userId)
			.first<{ last_login: number | null }>();
		expect(user?.last_login).not.toBeNull();
	});

	it('rejects a wrong password without revealing whether the email exists', async () => {
		const knownEmail = uniqueEmail();
		await registerAndVerify(knownEmail, 'Str0ngPass123');

		const wrongPasswordForRealUser = await loginUser(
			knownEmail,
			'WrongPass123'
		);
		const unknownEmail = await loginUser(uniqueEmail(), 'WrongPass123');

		expect(wrongPasswordForRealUser.status).toBe(401);
		expect(unknownEmail.status).toBe(401);
		expect(wrongPasswordForRealUser.body).toEqual(unknownEmail.body);
	});

	it('locks the account after 5 failed attempts; only the correct password reveals it via 429', async () => {
		const email = uniqueEmail();
		await registerAndVerify(email, 'Str0ngPass123');

		for (let i = 0; i < 5; i++) {
			const attempt = await loginUser(email, 'WrongPass123');
			expect(attempt.status).toBe(401);
		}

		// A wrong password while locked still reads as a plain bad-credentials response -- it must
		// not reveal that the account is locked out (see routes/auth.ts's `/login` ordering).
		const wrongPasswordWhileLocked = await loginUser(email, 'WrongPass123');
		expect(wrongPasswordWhileLocked.status).toBe(401);

		// Only the *correct* password, while locked, reveals the lockout via 429 + Retry-After.
		const correctPasswordWhileLocked = await loginUser(email, 'Str0ngPass123');
		expect(correctPasswordWhileLocked.status).toBe(429);
		expect(
			correctPasswordWhileLocked.response.headers.get('Retry-After')
		).toBeTruthy();
	});

	it('does not count "TOTP code required" toward the failed-attempt lockout', async () => {
		const email = uniqueEmail();
		const { cookies } = await createLoggedInUser(email);
		const { secret } = await enrollTotp(cookies);

		// The password is correct every time -- only the TOTP code is missing -- so none of these
		// should count as a failed attempt, no matter how many times it repeats.
		for (let i = 0; i < FAILED_ATTEMPT_LIMIT; i++) {
			const attempt = await loginUser(email, 'Str0ngPass123');
			expect(attempt.status).toBe(401);
			expect(JSON.stringify(attempt.body)).toContain('TOTP code required');
		}

		// Still not locked out -- a correct password + valid TOTP code logs in right away.
		const code = await currentTotpCode(secret);
		const result = await loginUser(email, 'Str0ngPass123', code);
		expect(result.status).toBe(200);
	});

	it('rejects a suspended account even with the correct password', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');
		await suspendDirectly(userId);

		const result = await loginUser(email, 'Str0ngPass123');
		expect(result.status).toBe(403);
	});

	it('rejects a banned account even with the correct password', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');
		await env.DB.prepare(
			"UPDATE users SET status = 'banned' WHERE user_id = ?1"
		)
			.bind(userId)
			.run();

		const result = await loginUser(email, 'Str0ngPass123');
		expect(result.status).toBe(403);
	});

	it('rejects a pending account with an unconsumed admin-forced reset, even with the correct password', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');
		await env.DB.prepare(
			"UPDATE users SET status = 'pending' WHERE user_id = ?1"
		)
			.bind(userId)
			.run();
		await env.DB.prepare(
			`INSERT INTO auth_tokens (id, user_id, purpose, forced_by_admin, expires_at, created_at)
       VALUES (?1, ?2, 'password_reset', 1, ?3, ?4)`
		)
			.bind(
				`test_token_${crypto.randomUUID()}`,
				userId,
				Date.now() + 3_600_000,
				Date.now()
			)
			.run();

		// Even the correct password is rejected -- the account must go through reset-password first.
		const result = await loginUser(email, 'Str0ngPass123');
		expect(result.status).toBe(403);
	});

	it('rejects a pending account with a wrong password the same generic way as any other account', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');
		await env.DB.prepare(
			"UPDATE users SET status = 'pending' WHERE user_id = ?1"
		)
			.bind(userId)
			.run();

		// A wrong password must never reveal the pending/forced-reset state -- only a *correct*
		// password reaches that check (see routes/auth.ts's `/login` ordering).
		const result = await loginUser(email, 'WrongPass123');
		expect(result.status).toBe(401);
		expect(JSON.stringify(result.body)).not.toContain('reset');
	});

	it('rejects a cookie-less login attempt without a CSRF token (login CSRF)', async () => {
		const email = uniqueEmail();
		await registerAndVerify(email, 'Str0ngPass123');

		// No cookies at all -- the classic login-CSRF setup: a victim with no prior csrfToken/session
		// cookie, cross-site POSTed straight at /login.
		const result = await callApp('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password: 'Str0ngPass123' }),
		});
		expect(result.status).toBe(403);
		expect(result.cookies.session).toBeUndefined();
	});
});

describe('an existing session stops working once the account is suspended or banned', () => {
	it('401s on the next request after a direct suspend', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');
		const login = await loginUser(email, 'Str0ngPass123');
		expect(login.status).toBe(200);

		await suspendDirectly(userId);

		const me = await callApp('/api/auth/me', { cookies: login.cookies });
		expect(me.status).toBe(401);
	});

	it('401s on the next request after a direct ban', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');
		const login = await loginUser(email, 'Str0ngPass123');
		expect(login.status).toBe(200);

		await env.DB.prepare(
			"UPDATE users SET status = 'banned' WHERE user_id = ?1"
		)
			.bind(userId)
			.run();

		const me = await callApp('/api/auth/me', { cookies: login.cookies });
		expect(me.status).toBe(401);
	});
});

describe('POST /api/auth/forgot-password and /resend-verification', () => {
	it('forgot-password responds identically for a real and a fake email', async () => {
		const knownEmail = uniqueEmail();
		await registerAndVerify(knownEmail, 'Str0ngPass123');

		const real = await postJson(
			'/api/auth/forgot-password',
			{ email: knownEmail },
			{},
			{ ip: uniqueIp() }
		);
		const fake = await postJson(
			'/api/auth/forgot-password',
			{ email: uniqueEmail() },
			{},
			{ ip: uniqueIp() }
		);
		expect(real.status).toBe(200);
		expect(real.body).toEqual(fake.body);
	});

	it('actually creates a usable password-reset token for a real email, stored hashed', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');

		const token = await forgotPasswordAndCaptureToken(email);
		expect(token).toBeTruthy();

		// The stored row id is a SHA-256 hash of the emailed token, never the token itself -- a
		// database read alone must not be enough to complete a reset.
		const storedId = await getLatestAuthToken(userId, 'password_reset');
		expect(storedId).toBe(await hashToken(token));
		expect(storedId).not.toBe(token);
	});

	it('invalidates a prior unconsumed reset token when a new one is requested', async () => {
		const email = uniqueEmail();
		await registerAndVerify(email, 'Str0ngPass123');

		const firstToken = await forgotPasswordAndCaptureToken(email);
		await forgotPasswordAndCaptureToken(email);

		const reset = await postJson('/api/auth/reset-password', {
			token: firstToken,
			password: 'NewStr0ngPass456',
		});
		expect(reset.status).toBe(400);
	});

	it('resend-verification responds identically for a real and a fake email', async () => {
		const knownEmail = uniqueEmail();
		await registerUser(knownEmail, 'Str0ngPass123'); // unverified on purpose

		const real = await postJson(
			'/api/auth/resend-verification',
			{ email: knownEmail },
			{},
			{ ip: uniqueIp() }
		);
		const fake = await postJson(
			'/api/auth/resend-verification',
			{ email: uniqueEmail() },
			{},
			{ ip: uniqueIp() }
		);
		expect(real.status).toBe(200);
		expect(real.body).toEqual(fake.body);
	});
});

describe('POST /api/auth/reset-password', () => {
	it('updates the password, revokes every session, and logs in with the new password', async () => {
		const email = uniqueEmail();
		await registerAndVerify(email, 'Str0ngPass123');
		const oldLogin = await loginUser(email, 'Str0ngPass123');
		expect(oldLogin.status).toBe(200);

		const token = await forgotPasswordAndCaptureToken(email);
		const reset = await postJson('/api/auth/reset-password', {
			token,
			password: 'NewStr0ngPass456',
		});
		expect(reset.status).toBe(200);

		// The pre-reset session is dead.
		const meWithOldSession = await callApp('/api/auth/me', {
			cookies: oldLogin.cookies,
		});
		expect(meWithOldSession.status).toBe(401);

		// Old password no longer works; new one does.
		const oldPasswordLogin = await loginUser(email, 'Str0ngPass123');
		expect(oldPasswordLogin.status).toBe(401);
		const newPasswordLogin = await loginUser(email, 'NewStr0ngPass456');
		expect(newPasswordLogin.status).toBe(200);
	});

	it('rejects a reset for a suspended account, though the password still updates', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');
		const token = await forgotPasswordAndCaptureToken(email);
		await suspendDirectly(userId);

		const reset = await postJson('/api/auth/reset-password', {
			token,
			password: 'NewStr0ngPass456',
		});
		expect(reset.status).toBe(403);
	});

	it('rejects a reset for a still-pending (non-forced) account, granting no session', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');
		const token = await forgotPasswordAndCaptureToken(email);
		await env.DB.prepare(
			"UPDATE users SET status = 'pending' WHERE user_id = ?1"
		)
			.bind(userId)
			.run();

		// Same gate '/login' applies to a plain pending account -- a reset must not grant a session
		// '/login' itself wouldn't.
		const reset = await postJson('/api/auth/reset-password', {
			token,
			password: 'NewStr0ngPass456',
		});
		expect(reset.status).toBe(403);
		expect(reset.cookies.session).toBeUndefined();
	});

	it('completes for an unverified account, marks the email verified, and starts a session', async () => {
		const email = uniqueEmail();
		const { userId } = await registerUser(email, 'Str0ngPass123'); // unverified on purpose
		const token = await forgotPasswordAndCaptureToken(email);

		// Receiving and clicking the reset link proves control of the address on file.
		const reset = await postJson('/api/auth/reset-password', {
			token,
			password: 'NewStr0ngPass456',
		});
		expect(reset.status).toBe(200);
		expect(reset.cookies.session).toBeTruthy();

		const user = await env.DB.prepare(
			'SELECT email_verified FROM users WHERE user_id = ?1'
		)
			.bind(userId)
			.first<{ email_verified: number }>();
		expect(user?.email_verified).toBe(1);
	});

	it('a forced-by-admin reset restores a pending account to active', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');
		await env.DB.prepare(
			"UPDATE users SET status = 'pending' WHERE user_id = ?1"
		)
			.bind(userId)
			.run();
		const plaintextToken = `test_token_${crypto.randomUUID()}`;
		await env.DB.prepare(
			`INSERT INTO auth_tokens (id, user_id, purpose, forced_by_admin, expires_at, created_at)
       VALUES (?1, ?2, 'password_reset', 1, ?3, ?4)`
		)
			.bind(
				await hashToken(plaintextToken),
				userId,
				Date.now() + 3_600_000,
				Date.now()
			)
			.run();

		const reset = await postJson('/api/auth/reset-password', {
			token: plaintextToken,
			password: 'NewStr0ngPass456',
		});
		expect(reset.status).toBe(200);

		const user = await env.DB.prepare(
			'SELECT status FROM users WHERE user_id = ?1'
		)
			.bind(userId)
			.first<{ status: string }>();
		expect(user?.status).toBe('active');
	});
});

describe('POST /api/auth/bootstrap-admin', () => {
	it('promotes the calling session once, then permanently 409s', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');
		const login = await loginUser(email, 'Str0ngPass123');
		const seeded = await callApp('/api/auth/csrf-token', {
			cookies: login.cookies,
		});

		const call = async () =>
			callApp('/api/auth/bootstrap-admin', {
				method: 'POST',
				cookies: seeded.cookies,
				headers: {
					'x-csrf-token': (seeded.body as { csrfToken: string }).csrfToken,
					'x-bootstrap-secret': 'test-bootstrap-secret',
				},
			});

		const firstCall = await call();
		expect(firstCall.status).toBe(200);

		const user = await env.DB.prepare(
			'SELECT role FROM users WHERE user_id = ?1'
		)
			.bind(userId)
			.first<{ role: string }>();
		expect(user?.role).toBe('admin');

		const secondCall = await call();
		expect(secondCall.status).toBe(409);
	});

	it('rejects the wrong secret', async () => {
		const email = uniqueEmail();
		await registerAndVerify(email, 'Str0ngPass123');
		const login = await loginUser(email, 'Str0ngPass123');
		const seeded = await callApp('/api/auth/csrf-token', {
			cookies: login.cookies,
		});

		const result = await callApp('/api/auth/bootstrap-admin', {
			method: 'POST',
			cookies: seeded.cookies,
			headers: {
				'x-csrf-token': (seeded.body as { csrfToken: string }).csrfToken,
				'x-bootstrap-secret': 'wrong-secret',
			},
		});
		expect(result.status).toBe(403);
	});
});

describe('IP rate limiting on public auth endpoints', () => {
	it('blocks the 6th /register call from the same IP within the window', async () => {
		const ip = uniqueIp();
		for (let i = 0; i < 5; i++) {
			const result = await registerUser(uniqueEmail(), 'Str0ngPass123', ip);
			expect(result.userId).toBeTruthy();
		}
		const sixth = await postJson(
			'/api/auth/register',
			{
				username: `e2erl${Date.now()}`,
				email: uniqueEmail(),
				password: 'Str0ngPass123',
			},
			{},
			{ ip }
		);
		expect(sixth.status).toBe(429);
	});

	it('keeps /register and /forgot-password budgets independent for the same IP', async () => {
		const ip = uniqueIp();
		for (let i = 0; i < 5; i++) {
			await registerUser(uniqueEmail(), 'Str0ngPass123', ip);
		}
		const blocked = await postJson(
			'/api/auth/register',
			{
				username: `e2erl2${Date.now()}`,
				email: uniqueEmail(),
				password: 'Str0ngPass123',
			},
			{},
			{ ip }
		);
		expect(blocked.status).toBe(429);

		// Same IP, different route -- still allowed.
		const forgotPassword = await postJson(
			'/api/auth/forgot-password',
			{ email: uniqueEmail() },
			{},
			{ ip }
		);
		expect(forgotPassword.status).toBe(200);
	});

	it("rate-limits /login by IP, independent of any single account's lockout", async () => {
		const ip = uniqueIp();

		// Five different unknown emails from the same IP -- proves the budget is IP-keyed, not
		// account-keyed (an account-level lockout could never trigger here, there's no account).
		for (let i = 0; i < 5; i++) {
			const attempt = await postJson(
				'/api/auth/login',
				{ email: uniqueEmail(), password: 'WrongPass123' },
				{},
				{ ip }
			);
			expect(attempt.status).toBe(401);
		}

		const sixth = await postJson(
			'/api/auth/login',
			{ email: uniqueEmail(), password: 'WrongPass123' },
			{},
			{ ip }
		);
		expect(sixth.status).toBe(429);
	});

	it('rate-limits /reset-password by IP', async () => {
		const ip = uniqueIp();
		for (let i = 0; i < 5; i++) {
			const attempt = await postJson(
				'/api/auth/reset-password',
				{ token: 'a'.repeat(64), password: 'Str0ngPass123' },
				{},
				{ ip }
			);
			expect(attempt.status).toBe(400);
		}

		const sixth = await postJson(
			'/api/auth/reset-password',
			{ token: 'a'.repeat(64), password: 'Str0ngPass123' },
			{},
			{ ip }
		);
		expect(sixth.status).toBe(429);
	});
});

describe('security headers', () => {
	it('are present on API responses', async () => {
		const result = await callApp('/health');
		expect(result.response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
		expect(result.response.headers.get('X-Content-Type-Options')).toBe(
			'nosniff'
		);
		expect(result.response.headers.get('Cross-Origin-Resource-Policy')).toBe(
			'cross-origin'
		);
	});
});

describe('CORS', () => {
	it('fails closed (no Access-Control-Allow-Origin) rather than reflecting the caller origin when ALLOWED_ORIGINS is unset', async () => {
		const original = env.ALLOWED_ORIGINS;
		env.ALLOWED_ORIGINS = '';
		try {
			const result = await callApp('/health', {
				headers: { Origin: 'https://evil.example.com' },
			});
			expect(
				result.response.headers.get('Access-Control-Allow-Origin')
			).toBeNull();
		} finally {
			env.ALLOWED_ORIGINS = original;
		}
	});
});

describe('logout', () => {
	it('destroys the session', async () => {
		const email = uniqueEmail();
		await registerAndVerify(email, 'Str0ngPass123');
		const login = await loginUser(email, 'Str0ngPass123');

		const seeded = await callApp('/api/auth/csrf-token', {
			cookies: login.cookies,
		});
		const logout = await callApp('/api/auth/logout', {
			method: 'POST',
			cookies: seeded.cookies,
			headers: {
				'x-csrf-token': (seeded.body as { csrfToken: string }).csrfToken,
			},
		});
		expect(logout.status).toBe(204);

		const me = await callApp('/api/auth/me', { cookies: login.cookies });
		expect(me.status).toBe(401);
	});
});
