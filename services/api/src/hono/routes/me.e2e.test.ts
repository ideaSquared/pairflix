import { describe, expect, it } from 'vitest';
import { currentTotpCode } from '../lib/totp';
import {
	createLoggedInUser,
	enrollTotp,
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
