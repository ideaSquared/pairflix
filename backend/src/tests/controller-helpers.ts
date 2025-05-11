import { Request, Response } from 'express';

// Mock Express request object
export const mockRequest = (overrides: Partial<Request> = {}) => {
	const req: Partial<Request> = {
		body: {},
		params: {},
		query: {},
		user: {
			user_id: 'test-user-id',
			email: 'test@example.com',
			username: 'testuser',
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 30,
				favoriteGenres: [],
			},
		},
		...overrides,
	};
	return req as Request;
};

// Mock Express response object
export const mockResponse = () => {
	const res: Partial<Response> = {
		json: jest.fn().mockReturnThis(),
		status: jest.fn().mockReturnThis(),
	};
	return res as Response;
};

// Mock services
export const mockServices = {
	// Auth service mocks
	auth: {
		authenticateUser: jest.fn(),
	},

	// User service mocks
	user: {
		findUserByEmailService: jest.fn(),
		updateEmailService: jest.fn(),
		updatePasswordService: jest.fn(),
		updateUsernameService: jest.fn(),
		updatePreferencesService: jest.fn(),
	},

	// Watchlist service mocks
	watchlist: {
		addToWatchlistService: jest.fn(),
		getWatchlistService: jest.fn(),
		updateWatchlistEntryService: jest.fn(),
		getMatchesService: jest.fn(),
	},

	// Match service mocks
	match: {
		createMatchService: jest.fn(),
		getMatchesService: jest.fn(),
		updateMatchStatusService: jest.fn(),
	},

	// Search service mocks
	search: {
		searchMediaService: jest.fn(),
	},
};

// Reset all mocks between tests
export const resetMocks = () => {
	jest.clearAllMocks();
	Object.values(mockServices).forEach(serviceGroup => {
		Object.values(serviceGroup).forEach(mock => {
			mock.mockClear();
		});
	});
};
