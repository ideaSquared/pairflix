/**
 * Password hashing using the Web Crypto API (PBKDF2-HMAC-SHA256).
 *
 * Workers has no native bcrypt, and Web Crypto is built in -- no dependencies.
 * Stored format: `pbkdf2$<iterations>$<saltB64>$<hashB64>`.
 */
const encoder = new TextEncoder();
const ITERATIONS = 100_000;
const KEY_BITS = 256;

const toBase64 = (bytes: ArrayBuffer): string =>
	btoa(String.fromCharCode(...new Uint8Array(bytes)));

const fromBase64 = (value: string): Uint8Array =>
	Uint8Array.from(atob(value), char => char.charCodeAt(0));

const deriveBits = async (
	password: string,
	salt: Uint8Array,
	iterations: number
): Promise<string> => {
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
		key,
		KEY_BITS
	);
	return toBase64(bits);
};

export const timingSafeEqual = (a: string, b: string): boolean => {
	if (a.length !== b.length) return false;
	let mismatch = 0;
	for (let i = 0; i < a.length; i += 1)
		mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return mismatch === 0;
};

export const hashPassword = async (password: string): Promise<string> => {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const hash = await deriveBits(password, salt, ITERATIONS);
	return `pbkdf2$${ITERATIONS}$${toBase64(salt.buffer)}$${hash}`;
};

export const verifyPassword = async (
	password: string,
	stored: string
): Promise<boolean> => {
	const [scheme, iterations, saltB64, expected] = stored.split('$');
	if (scheme !== 'pbkdf2' || !iterations || !saltB64 || !expected) return false;
	const hash = await deriveBits(
		password,
		fromBase64(saltB64),
		Number(iterations)
	);
	return timingSafeEqual(hash, expected);
};

/**
 * Symmetric encryption for the TOTP secret at rest (AES-256-GCM, key derived from
 * `SESSION_SECRET`). Stored format: `aesgcm$<ivB64>$<cipherB64>`.
 */
const deriveAesKey = async (secret: string): Promise<CryptoKey> => {
	const digest = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
	return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, [
		'encrypt',
		'decrypt',
	]);
};

export const encryptSecret = async (
	plaintext: string,
	secret: string
): Promise<string> => {
	const key = await deriveAesKey(secret);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const cipher = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		encoder.encode(plaintext)
	);
	return `aesgcm$${toBase64(iv.buffer)}$${toBase64(cipher)}`;
};

export const decryptSecret = async (
	stored: string,
	secret: string
): Promise<string> => {
	const [scheme, ivB64, cipherB64] = stored.split('$');
	if (scheme !== 'aesgcm' || !ivB64 || !cipherB64)
		throw new Error('Invalid ciphertext');
	const key = await deriveAesKey(secret);
	const plaintext = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: fromBase64(ivB64) },
		key,
		fromBase64(cipherB64)
	);
	return new TextDecoder().decode(plaintext);
};
