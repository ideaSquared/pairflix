// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL =
	'postgresql://postgres:postgres@localhost:5432/pairflix_test';

// Mock Sequelize for all tests
jest.mock('sequelize', () => {
	const mockSequelize = {
		authenticate: jest.fn().mockResolvedValue(true),
		// Update the define method to return a mock model
		define: jest.fn((modelName, attributes, options) => {
			return {
				modelName,
				attributes,
				options,
				sync: jest.fn().mockResolvedValue(true),
				findAll: jest.fn(),
				findOne: jest.fn(),
				create: jest.fn(),
				update: jest.fn(),
				destroy: jest.fn(),
			};
		}),
		model: jest.fn(),
		models: {},
		sync: jest.fn().mockResolvedValue(true),
		transaction: jest.fn().mockImplementation(fn => fn()),
		close: jest.fn().mockResolvedValue(true), // Added close method
		// Add other Sequelize methods as needed
	};

	const actualSequelize = jest.requireActual('sequelize');
	return {
		...actualSequelize,
		Sequelize: jest.fn(() => mockSequelize),
	};
});

// Mock bcrypt for password hashing
jest.mock('bcryptjs', () => ({
	compare: jest.fn(),
	hash: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
	sign: jest.fn(),
	verify: jest.fn(),
}));
