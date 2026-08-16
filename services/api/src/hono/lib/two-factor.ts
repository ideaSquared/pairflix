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
 * Decrypt failure (missing/rotated SESSION_SECRET, corrupted ciphertext) or malformed stored
 * backup-code JSON is treated as "code didn't match" rather than left to throw -- callers (login,
 * 2FA disable) shouldn't 500 an auth check just because the stored secret couldn't be read.
 */
export const verifySecondFactor = async (
	user: UserRow,
	code: string,
	sessionSecret: string
): Promise<SecondFactorResult> => {
	try {
		if (user.totpSecret) {
			const totpSecret = await decryptSecret(user.totpSecret, sessionSecret);
			if (await verifyTotpCode(totpSecret, code))
				return { ok: true, consumedBackupCodes: null };
		}

		const hashes: string[] = user.totpBackupCodes
			? JSON.parse(user.totpBackupCodes)
			: [];
		for (let i = 0; i < hashes.length; i += 1) {
			if (await verifyPassword(code, hashes[i] as string)) {
				const remaining = [...hashes.slice(0, i), ...hashes.slice(i + 1)];
				return { ok: true, consumedBackupCodes: JSON.stringify(remaining) };
			}
		}
		return { ok: false };
	} catch (error) {
		console.error('[two-factor] verification failed', error);
		return { ok: false };
	}
};
