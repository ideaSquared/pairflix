import type { UserRow } from '@pairflix/db';
import { decryptSecret, verifyPassword } from './crypto';
import { verifyTotpCode } from './totp';

export type SecondFactorResult =
	{ ok: true; consumedBackupCodes: string | null } | { ok: false };

/**
 * Checks a 6-digit TOTP code, falling back to single-use backup codes. When a
 * backup code matches, returns the remaining-codes JSON so the caller can
 * persist it (consuming that code).
 *
 * The TOTP-secret and backup-code checks are failure-isolated from each other: a decrypt failure
 * (missing/rotated SESSION_SECRET, corrupted ciphertext) only rules out the TOTP path and falls
 * through to backup codes, rather than failing the whole check -- someone whose TOTP secret can't
 * be read should still be able to use a valid backup code. Malformed stored backup-code JSON is
 * likewise treated as "no backup codes available" rather than left to throw -- callers (login, 2FA
 * disable) shouldn't 500 an auth check just because stored data couldn't be read.
 */
export const verifySecondFactor = async (
	user: UserRow,
	code: string,
	sessionSecret: string
): Promise<SecondFactorResult> => {
	if (user.totpSecret) {
		try {
			const totpSecret = await decryptSecret(user.totpSecret, sessionSecret);
			if (await verifyTotpCode(totpSecret, code))
				return { ok: true, consumedBackupCodes: null };
		} catch (error) {
			console.error(
				'[two-factor] TOTP secret decrypt/verify failed, falling back to backup codes',
				error
			);
		}
	}

	try {
		const hashes: string[] = user.totpBackupCodes
			? JSON.parse(user.totpBackupCodes)
			: [];
		for (let i = 0; i < hashes.length; i += 1) {
			if (await verifyPassword(code, hashes[i] as string)) {
				const remaining = [...hashes.slice(0, i), ...hashes.slice(i + 1)];
				return { ok: true, consumedBackupCodes: JSON.stringify(remaining) };
			}
		}
	} catch (error) {
		console.error('[two-factor] backup code check failed', error);
	}

	return { ok: false };
};
