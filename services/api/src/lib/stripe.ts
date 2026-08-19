import { timingSafeEqual } from './crypto';
import type { Bindings } from '../types';

/**
 * Minimal Stripe REST client -- raw fetch against the Stripe API rather than the `stripe` npm
 * SDK, matching creatorgrid's `lib/stripe.ts` (the pattern CLAUDE.md names to port). The SDK
 * needs Node APIs this Worker doesn't otherwise require (see wrangler.jsonc's "no nodejs_compat"
 * comment); this file only ever touches `fetch`, `URLSearchParams`, `btoa`, and `crypto.subtle`.
 *
 * "Unconfigured is a valid state": there's no guard function here -- every call site checks
 * `isStripeConfigured`/the relevant env var before calling in, and these functions take the
 * secret as a parameter rather than reading `env` internally, matching creatorgrid's split
 * between "is this configured" (checked by the route) and "do the Stripe call" (this file).
 */
const STRIPE_API = 'https://api.stripe.com/v1';
const encoder = new TextEncoder();

type StripeConfigEnv = Pick<
	Bindings,
	'STRIPE_SECRET_KEY' | 'STRIPE_PRICE_PREMIUM'
>;

/** Pairflix is single-tier (free/premium), unlike creatorgrid's four paid plans -- configured
 * means both the secret key and the one price id are set. A type predicate so callers
 * (lib/billing.ts) get `env.STRIPE_SECRET_KEY`/`env.STRIPE_PRICE_PREMIUM` narrowed to `string`
 * after an `if (isStripeConfigured(env))` check, rather than needing a non-null assertion. Takes
 * just the two fields it needs rather than all of `Bindings`, so it stays a type guard against the
 * full `Bindings` at real call sites while still being constructible directly in tests. */
export const isStripeConfigured = (
	env: StripeConfigEnv
): env is StripeConfigEnv & {
	STRIPE_SECRET_KEY: string;
	STRIPE_PRICE_PREMIUM: string;
} => Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_PREMIUM);

const stripeRequest = async <T>(
	secretKey: string,
	path: string,
	body: URLSearchParams
): Promise<T> => {
	const response = await fetch(`${STRIPE_API}${path}`, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${btoa(`${secretKey}:`)}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body,
	});
	if (!response.ok) {
		throw new Error(
			`Stripe API error (${response.status}): ${await response.text()}`
		);
	}
	return response.json();
};

export type CreateCheckoutSessionParams = {
	secretKey: string;
	priceId: string;
	customerId: string | null;
	customerEmail: string;
	successUrl: string;
	cancelUrl: string;
	householdId: string;
};

/** Metadata is stamped onto both the session and `subscription_data[metadata]` so the
 * `customer.subscription.*` webhook events carry `householdId` too, not just
 * `checkout.session.completed` -- lets the webhook resolve a household even if a subscription
 * event arrives before (or without) that event, see `routes/billing.ts`. */
export const createCheckoutSession = async (
	params: CreateCheckoutSessionParams
): Promise<{ url: string }> => {
	const body = new URLSearchParams({
		mode: 'subscription',
		'line_items[0][price]': params.priceId,
		'line_items[0][quantity]': '1',
		success_url: params.successUrl,
		cancel_url: params.cancelUrl,
		'metadata[householdId]': params.householdId,
		'subscription_data[metadata][householdId]': params.householdId,
	});
	if (params.customerId) {
		body.set('customer', params.customerId);
	} else {
		body.set('customer_email', params.customerEmail);
	}
	const session = await stripeRequest<{ url: string | null }>(
		params.secretKey,
		'/checkout/sessions',
		body
	);
	if (!session.url) throw new Error('Stripe did not return a checkout URL');
	return { url: session.url };
};

export type CreatePortalSessionParams = {
	secretKey: string;
	customerId: string;
	returnUrl: string;
};

export const createPortalSession = async (
	params: CreatePortalSessionParams
): Promise<{ url: string }> =>
	stripeRequest<{ url: string }>(
		params.secretKey,
		'/billing_portal/sessions',
		new URLSearchParams({
			customer: params.customerId,
			return_url: params.returnUrl,
		})
	);

/** Manual signature verification per Stripe's "verify manually" docs
 * (stripe.com/docs/webhooks#verify-manually) -- HMAC-SHA256 over `${timestamp}.${payload}` via
 * Web Crypto (native to Workers), compared with the existing constant-time `timingSafeEqual`
 * rather than a second copy of it. `now`/`toleranceSeconds` are parameters (not read from
 * `Date.now()` internally) purely so this is unit-testable with a fixed clock. */
export const verifyWebhookSignature = async (
	payload: string,
	signatureHeader: string | null,
	webhookSecret: string,
	toleranceSeconds = 300,
	now: number = Date.now()
): Promise<boolean> => {
	if (!signatureHeader) return false;
	const parts: Record<string, string> = {};
	for (const part of signatureHeader.split(',')) {
		const [key, value] = part.split('=');
		if (key && value) parts[key] = value;
	}
	const timestamp = parts.t;
	const signature = parts.v1;
	if (!timestamp || !signature) return false;
	const timestampSeconds = Number(timestamp);
	if (!Number.isFinite(timestampSeconds)) return false;
	if (Math.abs(now / 1000 - timestampSeconds) > toleranceSeconds) return false;

	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(webhookSecret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const digest = await crypto.subtle.sign(
		'HMAC',
		key,
		encoder.encode(`${timestamp}.${payload}`)
	);
	const expected = [...new Uint8Array(digest)]
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
	return timingSafeEqual(expected, signature);
};
