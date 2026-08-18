import { describe, expect, it } from 'vitest';
import { currentTotpCode } from '../lib/totp';
import {
	callApp,
	createLoggedInUser,
	enrollTotp,
	getCsrfToken,
	getLatestAuthToken,
	loginUser,
	postJson,
} from '../test/test-helpers';

let counter = 0;
const uniqueEmail = () => `me-e2e-${Date.now()}-${counter++}@example.com`;
const PASSWORD = 'Str0ngPass123';

describe('2FA enroll / verify / login / disable', () => {
	it('enrolling requires a valid code, then login requires one too', async () => {
		const email = uniqueEmail();
		const { cookies } = await createLoggedInUser(email);
		const { secret } = await enrollTotp(cookies);

		const withoutCode = await loginUser(email, PASSWORD);
		expect(withoutCode.status).toBe(401);
		expect(JSON.stringify(withoutCode.body)).toContain('TOTP code required');

		const code = await currentTotpCode(secret);
		const withCode = await loginUser(email, PASSWORD, code);
		expect(withCode.status).toBe(200);
	});

	it('rejects a wrong 2FA code', async () => {
		const email = uniqueEmail();
		const { cookies } = await createLoggedInUser(email);
		await enrollTotp(cookies);

		const result = await loginUser(email, PASSWORD, '000000');
		expect(result.status).toBe(401);
	});

	it('consumes a backup code once, then rejects reusing it', async () => {
		const email = uniqueEmail();
		const { cookies } = await createLoggedInUser(email);
		const { backupCodes } = await enrollTotp(cookies);
		const backupCode = backupCodes[0] as string;

		const first = await loginUser(email, PASSWORD, backupCode);
		expect(first.status).toBe(200);

		const second = await loginUser(email, PASSWORD, backupCode);
		expect(second.status).toBe(401);
	});

	it('disable requires password + a valid code, then login no longer asks for one', async () => {
		const email = uniqueEmail();
		const { cookies } = await createLoggedInUser(email);
		const { secret } = await enrollTotp(cookies);

		const code = await currentTotpCode(secret);
		const disable = await postJson(
			'/api/me/2fa/disable',
			{ currentPassword: PASSWORD, code },
			cookies
		);
		expect(disable.status).toBe(204);

		const login = await loginUser(email, PASSWORD);
		expect(login.status).toBe(200);
	});
});

describe('profile updates', () => {
	it('changes username, then rejects one already taken', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());

		const newUsername = `renamed${Date.now()}`;
		const renamed = await postJson(
			'/api/me/username',
			{ username: newUsername },
			cookies,
			{ method: 'PATCH' }
		);
		expect(renamed.status).toBe(200);

		const me = await callApp<{ data: { username: string } }>('/api/auth/me', {
			cookies,
		});
		expect(me.body.data.username).toBe(newUsername);

		const { cookies: otherCookies } = await createLoggedInUser(uniqueEmail());
		const taken = await postJson(
			'/api/me/username',
			{ username: newUsername },
			otherCookies,
			{ method: 'PATCH' }
		);
		expect(taken.status).toBe(409);
	});

	it('returns a clean 409, not a 500, when two users race to claim the same username', async () => {
		const { cookies: cookiesA } = await createLoggedInUser(uniqueEmail());
		const { cookies: cookiesB } = await createLoggedInUser(uniqueEmail());
		const claim = (
			csrf: { csrfToken: string; cookies: Record<string, string> },
			username: string
		) =>
			callApp('/api/me/username', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'x-csrf-token': csrf.csrfToken,
				},
				body: JSON.stringify({ username }),
				cookies: csrf.cookies,
			});

		// Whether two truly-concurrent requests actually collide at the DB layer (rather than one
		// fully finishing before the other's pre-check SELECT even runs) is timing-dependent --
		// measured empirically at ~20% of attempts in this harness. 40 fresh-username attempts (same
		// two already-logged-in users throughout, to keep this well under the test timeout) pushes
		// the chance of never once hitting that overlap down close to zero, without changing what's
		// actually asserted: every attempt, raced or not, must resolve to exactly one 200 and one
		// 409, never a 500.
		for (let attempt = 0; attempt < 40; attempt++) {
			const [csrfA, csrfB] = await Promise.all([
				getCsrfToken(cookiesA),
				getCsrfToken(cookiesB),
			]);
			const targetUsername = `raceduser${Date.now()}${attempt}`;
			const [first, second] = await Promise.all([
				claim(csrfA, targetUsername),
				claim(csrfB, targetUsername),
			]);
			const statuses = [first.status, second.status].sort((a, b) => a - b);
			expect(statuses).toEqual([200, 409]);
		}
	}, 30_000);

	it('email change requires the current password and only takes effect once confirmed', async () => {
		const { userId, cookies } = await createLoggedInUser(uniqueEmail());
		const newEmail = uniqueEmail();

		const wrongPassword = await postJson(
			'/api/me/email',
			{ email: newEmail, password: 'WrongPassword1' },
			cookies
		);
		expect(wrongPassword.status).toBe(401);

		const requested = await postJson(
			'/api/me/email',
			{ email: newEmail, password: PASSWORD },
			cookies
		);
		expect(requested.status).toBe(200);

		const meBeforeConfirm = await callApp<{ data: { email: string } }>(
			'/api/auth/me',
			{ cookies }
		);
		expect(meBeforeConfirm.body.data.email).not.toBe(newEmail);

		const token = await getLatestAuthToken(userId, 'change_email');
		const confirmed = await postJson('/api/auth/verify-email', { token }, {});
		expect(confirmed.status).toBe(200);

		const meAfterConfirm = await callApp<{ data: { email: string } }>(
			'/api/auth/me',
			{ cookies }
		);
		expect(meAfterConfirm.body.data.email).toBe(newEmail);
	});

	it('rejects confirming an email change if the address was claimed in the meantime', async () => {
		const { userId, cookies } = await createLoggedInUser(uniqueEmail());
		const contestedEmail = uniqueEmail();

		const requested = await postJson(
			'/api/me/email',
			{ email: contestedEmail, password: PASSWORD },
			cookies
		);
		expect(requested.status).toBe(200);

		const token = await getLatestAuthToken(userId, 'change_email');

		// Someone else registers (and claims) the contested address before the first user confirms.
		await createLoggedInUser(contestedEmail);

		const confirmed = await postJson('/api/auth/verify-email', { token }, {});
		expect(confirmed.status).toBe(409);
		expect(JSON.stringify(confirmed.body)).toContain('email_taken');
	});

	it('password change requires the current password and revokes other sessions', async () => {
		const email = uniqueEmail();
		const { cookies: sessionA } = await createLoggedInUser(email);
		const sessionB = (await loginUser(email, PASSWORD)).cookies;

		const wrongPassword = await postJson(
			'/api/me/password',
			{ currentPassword: 'WrongPassword1', newPassword: 'NewStr0ngPass1' },
			sessionA
		);
		expect(wrongPassword.status).toBe(401);

		const changed = await postJson(
			'/api/me/password',
			{ currentPassword: PASSWORD, newPassword: 'NewStr0ngPass1' },
			sessionA
		);
		expect(changed.status).toBe(204);

		const stillWorksA = await callApp('/api/auth/me', { cookies: sessionA });
		expect(stillWorksA.status).toBe(200);

		const revokedB = await callApp('/api/auth/me', { cookies: sessionB });
		expect(revokedB.status).toBe(401);

		const reloginOldPassword = await loginUser(email, PASSWORD);
		expect(reloginOldPassword.status).toBe(401);

		const reloginNewPassword = await loginUser(email, 'NewStr0ngPass1');
		expect(reloginNewPassword.status).toBe(200);
	});

	it('preferences update merges rather than replaces', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());

		const first = await postJson(
			'/api/me/preferences',
			{ preferences: { theme: 'light' } },
			cookies,
			{ method: 'PATCH' }
		);
		expect(first.status).toBe(200);

		const second = await postJson<{
			data: { preferences: { theme: string; autoArchiveDays: number } };
		}>(
			'/api/me/preferences',
			{ preferences: { autoArchiveDays: 7 } },
			cookies,
			{ method: 'PATCH' }
		);
		expect(second.status).toBe(200);
		expect(second.body.data.preferences.theme).toBe('light');
		expect(second.body.data.preferences.autoArchiveDays).toBe(7);
	});
});
