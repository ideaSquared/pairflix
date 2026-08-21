import { describe, expect, it } from 'vitest';
import {
	decryptSecret,
	encryptSecret,
	hashPassword,
	timingSafeEqual,
	verifyPassword,
} from './crypto';

describe('timingSafeEqual', () => {
	it('is true only for identical strings', () => {
		expect(timingSafeEqual('abc123', 'abc123')).toBe(true);
		expect(timingSafeEqual('abc123', 'abc124')).toBe(false);
	});

	it('is false when lengths differ', () => {
		expect(timingSafeEqual('abc', 'abcd')).toBe(false);
		expect(timingSafeEqual('', 'a')).toBe(false);
	});
});

describe('hashPassword / verifyPassword', () => {
	it('produces the pbkdf2 stored format', async () => {
		const stored = await hashPassword('Str0ngPass123');
		expect(stored).toMatch(/^pbkdf2\$100000\$[^$]+\$[^$]+$/);
	});

	it('uses a random salt so the same password hashes differently each time', async () => {
		const a = await hashPassword('Str0ngPass123');
		const b = await hashPassword('Str0ngPass123');
		expect(a).not.toBe(b);
	});

	it('verifies the correct password and rejects a wrong one', async () => {
		const stored = await hashPassword('Str0ngPass123');
		expect(await verifyPassword('Str0ngPass123', stored)).toBe(true);
		expect(await verifyPassword('wrong-password', stored)).toBe(false);
	});

	it('rejects a malformed stored hash instead of throwing', async () => {
		expect(await verifyPassword('whatever', 'not-a-hash')).toBe(false);
		expect(await verifyPassword('whatever', 'bcrypt$1$2$3')).toBe(false);
		expect(await verifyPassword('whatever', 'pbkdf2$100000$only-three')).toBe(
			false
		);
	});
});

describe('encryptSecret / decryptSecret', () => {
	const KEY = 'test-session-secret';

	it('round-trips a plaintext secret', async () => {
		const plaintext = 'JBSWY3DPEHPK3PXP';
		const cipher = await encryptSecret(plaintext, KEY);
		expect(cipher).toMatch(/^aesgcm\$[^$]+\$[^$]+$/);
		expect(await decryptSecret(cipher, KEY)).toBe(plaintext);
	});

	it('uses a fresh IV so identical plaintext encrypts differently', async () => {
		const a = await encryptSecret('same', KEY);
		const b = await encryptSecret('same', KEY);
		expect(a).not.toBe(b);
		expect(await decryptSecret(a, KEY)).toBe('same');
		expect(await decryptSecret(b, KEY)).toBe('same');
	});

	it('fails to decrypt with the wrong key', async () => {
		const cipher = await encryptSecret('secret', KEY);
		await expect(decryptSecret(cipher, 'different-secret')).rejects.toThrow();
	});

	it('throws on ciphertext that is not in the expected format', async () => {
		await expect(decryptSecret('not-ciphertext', KEY)).rejects.toThrow(
			'Invalid ciphertext'
		);
	});
});
