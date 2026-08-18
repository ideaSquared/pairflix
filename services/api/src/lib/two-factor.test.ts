import type { UserRow } from '@pairflix/db';
import { describe, expect, it } from 'vitest';
import { encryptSecret, hashPassword } from './crypto';
import { currentTotpCode, generateTotpSecret } from './totp';
import { verifySecondFactor } from './two-factor';

const SESSION_SECRET = 'test-session-secret';

const baseUser = (overrides: Partial<UserRow> = {}): UserRow => ({
	id: 'user_test',
	username: 'testuser',
	email: 'test@example.com',
	passwordHash: 'pbkdf2$100000$salt$hash',
	role: 'user',
	status: 'active',
	emailVerified: true,
	failedLoginAttempts: 0,
	lockedUntil: null,
	lastLogin: null,
	totpSecret: null,
	totpEnabled: true,
	totpBackupCodes: null,
	preferences: {
		theme: 'dark',
		viewStyle: 'grid',
		emailNotifications: true,
		autoArchiveDays: 30,
		favoriteGenres: [],
	},
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
});

describe('verifySecondFactor', () => {
	it('accepts a valid TOTP code', async () => {
		const secret = generateTotpSecret();
		const user = baseUser({
			totpSecret: await encryptSecret(secret, SESSION_SECRET),
		});
		const code = await currentTotpCode(secret);

		expect(await verifySecondFactor(user, code, SESSION_SECRET)).toEqual({
			ok: true,
			consumedBackupCodes: null,
		});
	});

	it('falls back to a valid backup code when the TOTP secret cannot be decrypted', async () => {
		// Not `aesgcm$<iv>$<cipher>` -- decryptSecret throws on this before ever comparing keys, the
		// same shape a corrupted column or a SESSION_SECRET rotation would produce.
		const backupCode = 'abcd1234ef';
		const user = baseUser({
			totpSecret: 'not-valid-ciphertext',
			totpBackupCodes: JSON.stringify([await hashPassword(backupCode)]),
		});

		const result = await verifySecondFactor(user, backupCode, SESSION_SECRET);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(JSON.parse(result.consumedBackupCodes ?? '[]')).toEqual([]);
		}
	});

	it('rejects a code that matches neither TOTP nor any backup code', async () => {
		const secret = generateTotpSecret();
		const user = baseUser({
			totpSecret: await encryptSecret(secret, SESSION_SECRET),
			totpBackupCodes: JSON.stringify([await hashPassword('unused-code')]),
		});

		expect(await verifySecondFactor(user, '000000', SESSION_SECRET)).toEqual({
			ok: false,
		});
	});
});
