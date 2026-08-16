import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import {
	callApp,
	getLatestAuthToken,
	loginUser,
	postJson,
	registerAndVerify,
	registerUser,
	suspendDirectly,
	uniqueIp,
} from '../test/test-helpers';

let counter = 0;
/** A fresh email per test -- isolated storage resets D1 between test *files*, not between tests
 * within one file, so tests that create accounts need non-colliding addresses. */
const uniqueEmail = () => `auth-e2e-${Date.now()}-${counter++}@example.com`;

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

	it('locks the account after 5 failed attempts, with Retry-After on the 6th', async () => {
		const email = uniqueEmail();
		await registerAndVerify(email, 'Str0ngPass123');

		for (let i = 0; i < 5; i++) {
			const attempt = await loginUser(email, 'WrongPass123');
			expect(attempt.status).toBe(401);
		}

		const sixth = await loginUser(email, 'WrongPass123');
		expect(sixth.status).toBe(429);
		expect(sixth.response.headers.get('Retry-After')).toBeTruthy();

		// Even the *correct* password is rejected while locked out.
		const correctPasswordWhileLocked = await loginUser(email, 'Str0ngPass123');
		expect(correctPasswordWhileLocked.status).toBe(429);
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

	it('rejects a pending account with an unconsumed admin-forced reset, before checking the password', async () => {
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

	it('actually creates a usable password-reset token for a real email', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');

		await postJson(
			'/api/auth/forgot-password',
			{ email },
			{},
			{ ip: uniqueIp() }
		);
		const token = await getLatestAuthToken(userId, 'password_reset');
		expect(token).toBeTruthy();
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
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');
		const oldLogin = await loginUser(email, 'Str0ngPass123');
		expect(oldLogin.status).toBe(200);

		await postJson(
			'/api/auth/forgot-password',
			{ email },
			{},
			{ ip: uniqueIp() }
		);
		const token = await getLatestAuthToken(userId, 'password_reset');
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
		await postJson(
			'/api/auth/forgot-password',
			{ email },
			{},
			{ ip: uniqueIp() }
		);
		const token = await getLatestAuthToken(userId, 'password_reset');
		await suspendDirectly(userId);

		const reset = await postJson('/api/auth/reset-password', {
			token,
			password: 'NewStr0ngPass456',
		});
		expect(reset.status).toBe(403);
	});

	it('a forced-by-admin reset restores a pending account to active', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');
		await env.DB.prepare(
			"UPDATE users SET status = 'pending' WHERE user_id = ?1"
		)
			.bind(userId)
			.run();
		const tokenId = `test_token_${crypto.randomUUID()}`;
		await env.DB.prepare(
			`INSERT INTO auth_tokens (id, user_id, purpose, forced_by_admin, expires_at, created_at)
       VALUES (?1, ?2, 'password_reset', 1, ?3, ?4)`
		)
			.bind(tokenId, userId, Date.now() + 3_600_000, Date.now())
			.run();

		const reset = await postJson('/api/auth/reset-password', {
			token: tokenId,
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

	it('never rate-limits /login by IP (account-level lockout only)', async () => {
		const ip = uniqueIp();
		const email = uniqueEmail();
		await registerAndVerify(email, 'Str0ngPass123');

		// 5 wrong-password attempts from one IP -- well past the 5/15min IP budget used elsewhere --
		// still resolve as 401 (bad password), never a same-IP-only 429.
		for (let i = 0; i < 5; i++) {
			const attempt = await callApp('/api/auth/login', {
				method: 'POST',
				ip,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password: 'WrongPass123' }),
			});
			expect(attempt.status).toBe(401);
		}
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
