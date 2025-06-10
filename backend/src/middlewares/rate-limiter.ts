import rateLimit from 'express-rate-limit';

// Helper function to get rate limit values based on environment
const getRateLimitConfig = (
	prodWindowMs: number,
	prodMax: number,
	devMultiplier: number = 10
) => {
	const isDevelopment = process.env.NODE_ENV === 'development';
	return {
		windowMs: prodWindowMs,
		max: isDevelopment ? prodMax * devMultiplier : prodMax,
	};
};

// General rate limiter for most endpoints
export const generalRateLimit = rateLimit({
	...getRateLimitConfig(15 * 60 * 1000, 100), // Dev: 1000 req/15min, Prod: 100 req/15min
	message: {
		error: 'Too many requests from this IP, please try again later.',
		retryAfter: '15 minutes',
	},
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for authentication endpoints
export const authRateLimit = rateLimit({
	...getRateLimitConfig(15 * 60 * 1000, 10, 20), // Dev: 200 req/15min, Prod: 10 req/15min
	message: {
		error:
			'Too many authentication attempts from this IP, please try again later.',
		retryAfter: '15 minutes',
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true, // Don't count successful requests
});

// Rate limiter for search endpoints (can be resource intensive)
export const searchRateLimit = rateLimit({
	...getRateLimitConfig(1 * 60 * 1000, 30, 10), // Dev: 300 req/min, Prod: 30 req/min
	message: {
		error: 'Too many search requests from this IP, please try again later.',
		retryAfter: '1 minute',
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Admin endpoint rate limiter (more restrictive)
export const adminRateLimit = rateLimit({
	...getRateLimitConfig(15 * 60 * 1000, 50, 20), // Dev: 1000 req/15min, Prod: 50 req/15min
	message: {
		error: 'Too many admin requests from this IP, please try again later.',
		retryAfter: '15 minutes',
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Very strict rate limiter for sensitive operations
export const strictRateLimit = rateLimit({
	...getRateLimitConfig(15 * 60 * 1000, 5, 40), // Dev: 200 req/15min, Prod: 5 req/15min
	message: {
		error:
			'Too many requests for this sensitive operation, please try again later.',
		retryAfter: '15 minutes',
	},
	standardHeaders: true,
	legacyHeaders: false,
});
