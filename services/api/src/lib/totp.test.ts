import { describe, expect, it } from 'vitest';
import {
	buildOtpAuthUrl,
	currentTotpCode,
	generateBackupCodes,
	generateTotpSecret,
	verifyTotpCode,
} from './totp';

// Base32 of the ASCII secret "12345678901234567890" -- the RFC 6238 SHA-1 test key.
const RFC_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

describe('currentTotpCode', () => {
	it('matches the published RFC 6238 SHA-1 vectors (6-digit truncation)', async () => {
		expect(await currentTotpCode(RFC_SECRET, 59_000)).toBe('287082');
		expect(await currentTotpCode(RFC_SECRET, 1_111_111_109_000)).toBe('081804');
		expect(await currentTotpCode(RFC_SECRET, 1_234_567_890_000)).toBe('005924');
	});

	it('is stable within a 30-second step and changes across the boundary', async () => {
		// Step-aligned (a multiple of 30_000 ms) so +29s stays in the same step.
		const at = 1_700_000_010_000;
		const code = await currentTotpCode(RFC_SECRET, at);
		expect(code).toMatch(/^\d{6}$/);
		expect(await currentTotpCode(RFC_SECRET, at + 29_000)).toBe(code);
		expect(await currentTotpCode(RFC_SECRET, at + 30_000)).not.toBe(code);
	});
});

describe('verifyTotpCode', () => {
	const at = 1_700_000_000_000;

	it('accepts the current code and one step of drift either side', async () => {
		const current = await currentTotpCode(RFC_SECRET, at);
		const previous = await currentTotpCode(RFC_SECRET, at - 30_000);
		const next = await currentTotpCode(RFC_SECRET, at + 30_000);
		expect(await verifyTotpCode(RFC_SECRET, current, at)).toBe(true);
		expect(await verifyTotpCode(RFC_SECRET, previous, at)).toBe(true);
		expect(await verifyTotpCode(RFC_SECRET, next, at)).toBe(true);
	});

	it('rejects a code two steps out of the drift window', async () => {
		const stale = await currentTotpCode(RFC_SECRET, at - 60_000);
		expect(await verifyTotpCode(RFC_SECRET, stale, at)).toBe(false);
	});

	it('rejects malformed input without throwing', async () => {
		expect(await verifyTotpCode(RFC_SECRET, '12345', at)).toBe(false);
		expect(await verifyTotpCode(RFC_SECRET, 'abcdef', at)).toBe(false);
		expect(await verifyTotpCode(RFC_SECRET, '', at)).toBe(false);
	});
});

describe('generateTotpSecret', () => {
	it('produces a base32 secret that its own codes verify against', async () => {
		const secret = generateTotpSecret();
		expect(secret).toMatch(/^[A-Z2-7]+$/);
		const at = 1_700_000_000_000;
		const code = await currentTotpCode(secret, at);
		expect(await verifyTotpCode(secret, code, at)).toBe(true);
	});
});

describe('buildOtpAuthUrl', () => {
	it('encodes the label and carries the authenticator parameters', () => {
		const url = buildOtpAuthUrl(RFC_SECRET, 'a@b.com');
		expect(url).toContain('otpauth://totp/Pairflix%3Aa%40b.com');
		expect(url).toContain(`secret=${RFC_SECRET}`);
		expect(url).toContain('issuer=Pairflix');
		expect(url).toContain('digits=6');
		expect(url).toContain('period=30');
	});
});

describe('generateBackupCodes', () => {
	it('generates ten distinct 10-hex-character codes by default', () => {
		const codes = generateBackupCodes();
		expect(codes).toHaveLength(10);
		for (const code of codes) expect(code).toMatch(/^[0-9a-f]{10}$/);
		expect(new Set(codes).size).toBe(10);
	});

	it('honours a custom count', () => {
		expect(generateBackupCodes(3)).toHaveLength(3);
	});
});
