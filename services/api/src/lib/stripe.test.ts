import { describe, expect, it } from 'vitest';
import { isStripeConfigured, verifyWebhookSignature } from './stripe';

const WEBHOOK_SECRET = 'whsec_test_secret';
const encoder = new TextEncoder();

/** Independent of `verifyWebhookSignature`'s own implementation -- signs the same way Stripe
 * itself does (stripe.com/docs/webhooks#verify-manually), not by reusing the code under test. */
const sign = async (
	payload: string,
	secret: string,
	timestamp: number
): Promise<string> => {
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const digest = await crypto.subtle.sign(
		'HMAC',
		key,
		encoder.encode(`${timestamp}.${payload}`)
	);
	const hex = [...new Uint8Array(digest)]
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
	return `t=${timestamp},v1=${hex}`;
};

describe('verifyWebhookSignature', () => {
	const payload = '{"type":"checkout.session.completed"}';
	const now = 1_700_000_000_000;

	it('accepts a validly signed payload', async () => {
		const header = await sign(payload, WEBHOOK_SECRET, Math.floor(now / 1000));
		expect(
			await verifyWebhookSignature(payload, header, WEBHOOK_SECRET, 300, now)
		).toBe(true);
	});

	it('rejects a tampered payload', async () => {
		const header = await sign(payload, WEBHOOK_SECRET, Math.floor(now / 1000));
		expect(
			await verifyWebhookSignature(
				'{"type":"tampered"}',
				header,
				WEBHOOK_SECRET,
				300,
				now
			)
		).toBe(false);
	});

	it('rejects a signature made with the wrong secret', async () => {
		const header = await sign(payload, 'whsec_wrong', Math.floor(now / 1000));
		expect(
			await verifyWebhookSignature(payload, header, WEBHOOK_SECRET, 300, now)
		).toBe(false);
	});

	it('rejects a timestamp outside the tolerance window', async () => {
		const staleSeconds = Math.floor(now / 1000) - 301;
		const header = await sign(payload, WEBHOOK_SECRET, staleSeconds);
		expect(
			await verifyWebhookSignature(payload, header, WEBHOOK_SECRET, 300, now)
		).toBe(false);
	});

	it('rejects a malformed or missing header', async () => {
		expect(
			await verifyWebhookSignature(payload, null, WEBHOOK_SECRET, 300, now)
		).toBe(false);
		expect(
			await verifyWebhookSignature(
				payload,
				'not-a-real-header',
				WEBHOOK_SECRET,
				300,
				now
			)
		).toBe(false);
		expect(
			await verifyWebhookSignature(payload, 't=123', WEBHOOK_SECRET, 300, now)
		).toBe(false);
	});
});

describe('isStripeConfigured', () => {
	it('requires both the secret key and the price id', () => {
		expect(
			isStripeConfigured({
				STRIPE_SECRET_KEY: 'sk_test',
				STRIPE_PRICE_PREMIUM: 'price_1',
			})
		).toBe(true);
		expect(isStripeConfigured({ STRIPE_SECRET_KEY: 'sk_test' })).toBe(false);
		expect(isStripeConfigured({ STRIPE_PRICE_PREMIUM: 'price_1' })).toBe(false);
		expect(isStripeConfigured({})).toBe(false);
	});
});
