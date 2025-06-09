import rateLimit from 'express-rate-limit';

// General rate limiter for most endpoints
export const generalRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: {
		error: 'Too many requests from this IP, please try again later.',
		retryAfter: '15 minutes',
	},
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for authentication endpoints
export const authRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 login attempts per windowMs
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
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 30, // Limit each IP to 30 search requests per minute
	message: {
		error: 'Too many search requests from this IP, please try again later.',
		retryAfter: '1 minute',
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Admin endpoint rate limiter (more restrictive)
export const adminRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 50, // Limit each IP to 50 admin requests per windowMs
	message: {
		error: 'Too many admin requests from this IP, please try again later.',
		retryAfter: '15 minutes',
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Very strict rate limiter for sensitive operations
export const strictRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 requests per windowMs for very sensitive operations
	message: {
		error:
			'Too many requests for this sensitive operation, please try again later.',
		retryAfter: '15 minutes',
	},
	standardHeaders: true,
	legacyHeaders: false,
});
