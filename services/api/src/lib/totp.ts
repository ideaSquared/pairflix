/**
 * TOTP (RFC 6238) over HMAC-SHA1 (RFC 4226), implemented on Web Crypto so it
 * runs in Workers without a dependency. Compatible with standard authenticator
 * apps (Google Authenticator, 1Password, ...), which expect SHA-1/6 digits/30s.
 */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;
const DIGITS = 6;

const base32Encode = (bytes: Uint8Array): string => {
	let bits = '';
	for (const byte of bytes) bits += byte.toString(2).padStart(8, '0');
	let output = '';
	for (let i = 0; i + 5 <= bits.length; i += 5) {
		output += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
	}
	const remainder = bits.length % 5;
	if (remainder)
		output +=
			BASE32_ALPHABET[parseInt(bits.slice(-remainder).padEnd(5, '0'), 2)];
	return output;
};

const base32Decode = (value: string): Uint8Array => {
	let bits = '';
	for (const char of value.toUpperCase().replace(/[^A-Z2-7]/g, '')) {
		bits += BASE32_ALPHABET.indexOf(char).toString(2).padStart(5, '0');
	}
	const bytes: number[] = [];
	for (let i = 0; i + 8 <= bits.length; i += 8)
		bytes.push(parseInt(bits.slice(i, i + 8), 2));
	return new Uint8Array(bytes);
};

const hotp = async (secret: Uint8Array, counter: number): Promise<string> => {
	const counterBytes = new DataView(new ArrayBuffer(8));
	counterBytes.setUint32(4, counter);
	const key = await crypto.subtle.importKey(
		'raw',
		secret as BufferSource,
		{ name: 'HMAC', hash: 'SHA-1' },
		false,
		['sign']
	);
	const signature = new Uint8Array(
		await crypto.subtle.sign('HMAC', key, counterBytes.buffer)
	);
	const offset = (signature[signature.length - 1] ?? 0) & 0x0f;
	const code =
		(((signature[offset] ?? 0) & 0x7f) << 24) |
		(((signature[offset + 1] ?? 0) & 0xff) << 16) |
		(((signature[offset + 2] ?? 0) & 0xff) << 8) |
		((signature[offset + 3] ?? 0) & 0xff);
	return String(code % 10 ** DIGITS).padStart(DIGITS, '0');
};

export const generateTotpSecret = (): string =>
	base32Encode(crypto.getRandomValues(new Uint8Array(20)));

/** The code an authenticator app would show for `secret` right now (or at `at`). */
export const currentTotpCode = (
	secret: string,
	at = Date.now()
): Promise<string> =>
	hotp(base32Decode(secret), Math.floor(at / 1000 / STEP_SECONDS));

export const buildOtpAuthUrl = (secret: string, email: string): string => {
	const label = encodeURIComponent(`Pairflix:${email}`);
	return `otpauth://totp/${label}?secret=${secret}&issuer=Pairflix&digits=${DIGITS}&period=${STEP_SECONDS}`;
};

/** Accepts the current step plus one step of clock drift either side. */
export const verifyTotpCode = async (
	secret: string,
	code: string,
	at = Date.now()
): Promise<boolean> => {
	if (!/^\d{6}$/.test(code)) return false;
	const key = base32Decode(secret);
	const counter = Math.floor(at / 1000 / STEP_SECONDS);
	for (const drift of [0, -1, 1]) {
		if ((await hotp(key, counter + drift)) === code) return true;
	}
	return false;
};

/** Short, easy-to-type recovery codes shown once at enrollment. */
export const generateBackupCodes = (count = 10): string[] =>
	Array.from({ length: count }, () => {
		const bytes = crypto.getRandomValues(new Uint8Array(5));
		return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
	});
