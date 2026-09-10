import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	AppClientUrlNotConfiguredError,
	EmailNotConfiguredError,
	EmailSendError,
	sendPasswordResetEmail,
	sendVerificationEmail,
} from './email';

const REAL_FETCH = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = REAL_FETCH;
	vi.restoreAllMocks();
});

const configuredEnv = {
	...env,
	RESEND_API_KEY: 'test-resend-key',
	EMAIL_FROM: 'noreply@pairflix.example',
	APP_CLIENT_URL: 'https://app.pairflix.example',
};

describe('sendVerificationEmail', () => {
	it('sends via Resend with the configured client URL when fully configured', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response('{}', { status: 200 }));
		globalThis.fetch = fetchMock;

		await sendVerificationEmail(configuredEnv, 'user@example.com', 'tok123');

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toBe('https://api.resend.com/emails');
		const body = JSON.parse(init.body as string);
		expect(body.to).toBe('user@example.com');
		expect(body.from).toBe('noreply@pairflix.example');
		expect(body.html).toContain(
			'https://app.pairflix.example/verify-email?token=tok123'
		);
	});

	it('logs and returns without sending when unconfigured outside production', async () => {
		const fetchMock = vi.fn();
		globalThis.fetch = fetchMock;
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		await sendVerificationEmail(
			{ ...env, RESEND_API_KEY: undefined, EMAIL_FROM: undefined },
			'user@example.com',
			'tok123'
		);

		expect(fetchMock).not.toHaveBeenCalled();
		// The recipient address must never reach the log line.
		const logged = warnSpy.mock.calls.map(call => call.join(' ')).join('\n');
		expect(logged).not.toContain('user@example.com');
	});

	it('throws EmailNotConfiguredError when unconfigured in production', async () => {
		const fetchMock = vi.fn();
		globalThis.fetch = fetchMock;

		await expect(
			sendVerificationEmail(
				{
					...env,
					ENVIRONMENT: 'production',
					RESEND_API_KEY: undefined,
					EMAIL_FROM: undefined,
					APP_CLIENT_URL: 'https://app.pairflix.example',
				},
				'user@example.com',
				'tok123'
			)
		).rejects.toBeInstanceOf(EmailNotConfiguredError);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('surfaces a failed Resend send as EmailSendError instead of swallowing it', async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(new Response('nope', { status: 500 }));
		vi.spyOn(console, 'error').mockImplementation(() => {});

		await expect(
			sendVerificationEmail(configuredEnv, 'user@example.com', 'tok123')
		).rejects.toBeInstanceOf(EmailSendError);
	});

	it('throws AppClientUrlNotConfiguredError in production when APP_CLIENT_URL is unset, even if Resend is configured', async () => {
		await expect(
			sendVerificationEmail(
				{
					...env,
					ENVIRONMENT: 'production',
					RESEND_API_KEY: 'test-resend-key',
					EMAIL_FROM: 'noreply@pairflix.example',
					APP_CLIENT_URL: undefined,
				},
				'user@example.com',
				'tok123'
			)
		).rejects.toBeInstanceOf(AppClientUrlNotConfiguredError);
	});

	it('falls back to the localhost client URL outside production when unset', async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(new Response('{}', { status: 200 }));

		await sendVerificationEmail(
			{
				...env,
				RESEND_API_KEY: 'test-resend-key',
				EMAIL_FROM: 'noreply@pairflix.example',
				APP_CLIENT_URL: undefined,
			},
			'user@example.com',
			'tok123'
		);

		const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
			.calls[0] as [string, RequestInit];
		const body = JSON.parse(init.body as string);
		expect(body.html).toContain('http://localhost:5173/verify-email');
	});
});

describe('sendPasswordResetEmail', () => {
	it('sends via Resend when fully configured', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response('{}', { status: 200 }));
		globalThis.fetch = fetchMock;

		await sendPasswordResetEmail(configuredEnv, 'user@example.com', 'tok456');

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		const body = JSON.parse(init.body as string);
		expect(body.html).toContain(
			'https://app.pairflix.example/reset-password?token=tok456'
		);
	});
});
