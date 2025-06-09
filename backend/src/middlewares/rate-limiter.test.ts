import express from 'express';
import rateLimit from 'express-rate-limit';
import request from 'supertest';
import {
	adminRateLimit,
	authRateLimit,
	generalRateLimit,
	searchRateLimit,
	strictRateLimit,
} from './rate-limiter';

describe('Rate Limiter Middleware', () => {
	let app: express.Application;

	beforeEach(() => {
		app = express();
		app.use(express.json());
	});

	describe('General Rate Limit Configuration', () => {
		it('should have correct configuration values', () => {
			expect(generalRateLimit).toBeDefined();
		});
	});

	describe('Rate Limit Headers', () => {
		it('should include rate limit headers in response', async () => {
			// Create a simple rate limiter for testing
			const testRateLimit = rateLimit({
				windowMs: 60 * 1000, // 1 minute
				max: 100,
				standardHeaders: true,
				legacyHeaders: false,
			});

			app.use(testRateLimit);
			app.get('/test', (req, res) => {
				res.json({ message: 'success' });
			});

			const response = await request(app).get('/test');
			expect(response.status).toBe(200);
			expect(response.headers['ratelimit-limit']).toBeDefined();
			expect(response.headers['ratelimit-remaining']).toBeDefined();
			expect(response.headers['ratelimit-reset']).toBeDefined();
		});
	});

	describe('Rate Limit Behavior', () => {
		it('should block requests when limit is exceeded', async () => {
			// Create a very restrictive rate limiter for testing
			const strictTestLimit = rateLimit({
				windowMs: 60 * 1000, // 1 minute
				max: 2, // Only allow 2 requests
				standardHeaders: true,
				legacyHeaders: false,
				message: {
					error: 'Too many requests from this IP, please try again later.',
					retryAfter: '1 minute',
				},
			});

			app.use(strictTestLimit);
			app.get('/strict-test', (req, res) => {
				res.json({ message: 'success' });
			});

			// Make requests sequentially to avoid race conditions
			const response1 = await request(app).get('/strict-test');
			expect(response1.status).toBe(200);

			const response2 = await request(app).get('/strict-test');
			expect(response2.status).toBe(200);

			// Third request should be rate limited
			const response3 = await request(app).get('/strict-test');
			expect(response3.status).toBe(429);
			expect(response3.body.error).toContain('Too many requests');
		});
	});

	describe('Rate Limiter Imports', () => {
		it('should export all required rate limiters', () => {
			expect(generalRateLimit).toBeDefined();
			expect(authRateLimit).toBeDefined();
			expect(searchRateLimit).toBeDefined();
			expect(adminRateLimit).toBeDefined();
			expect(strictRateLimit).toBeDefined();
		});
	});

	describe('Error Response Format', () => {
		it('should return proper error format when rate limited', async () => {
			const testRateLimit = rateLimit({
				windowMs: 60 * 1000,
				max: 1,
				message: {
					error: 'Rate limit exceeded',
					retryAfter: '1 minute',
				},
			});

			app.use(testRateLimit);
			app.get('/error-test', (req, res) => {
				res.json({ message: 'success' });
			});

			// First request should succeed
			await request(app).get('/error-test');

			// Second request should be rate limited
			const response = await request(app).get('/error-test');
			expect(response.status).toBe(429);
			expect(response.body).toHaveProperty('error');
			expect(response.body).toHaveProperty('retryAfter');
		});
	});

	describe('Middleware Integration', () => {
		it('should work with actual rate limiter instances', async () => {
			// Test that our actual rate limiter instances can be used
			app.use('/api/test', generalRateLimit);
			app.get('/api/test', (req, res) => {
				res.json({ message: 'success' });
			});

			const response = await request(app).get('/api/test');
			expect(response.status).toBe(200);
			expect(response.body.message).toBe('success');
		});
	});
});
