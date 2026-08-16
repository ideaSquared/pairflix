/** Prefixed identifier, e.g. `user_9f2c...`. */
export const newId = (prefix: string): string =>
	`${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;

/** Opaque 256-bit token used for session ids, CSRF tokens, and auth tokens. */
export const randomToken = (): string =>
	[...crypto.getRandomValues(new Uint8Array(32))]
		.map(byte => byte.toString(16).padStart(2, '0'))
		.join('');
