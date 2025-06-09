// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL =
	'postgresql://postgres:postgres@localhost:5432/pairflix_test';

// Define types for better type safety
interface MockModel {
	modelName: string;
	attributes: unknown;
	options: unknown;
	sync: jest.Mock;
	findAll: jest.Mock;
	findOne: jest.Mock;
	findByPk: jest.Mock;
	create: jest.Mock;
	update: jest.Mock;
	destroy: jest.Mock;
	count: jest.Mock;
}

interface MockSequelizeInstance {
	authenticate: jest.Mock;
	define: jest.Mock;
	model: jest.Mock;
	models: Record<string, unknown>;
	sync: jest.Mock;
	transaction: jest.Mock;
	close: jest.Mock;
}

// Mock Sequelize for all tests
jest.mock('sequelize', () => {
	const mockSequelize: MockSequelizeInstance = {
		authenticate: jest.fn().mockResolvedValue(true),
		// Update the define method to return a mock model
		define: jest.fn(
			(
				modelName: string,
				attributes: unknown,
				options: unknown
			): MockModel => ({
				modelName,
				attributes,
				options,
				sync: jest.fn().mockResolvedValue(true),
				findAll: jest.fn(),
				findOne: jest.fn(),
				findByPk: jest.fn(),
				create: jest.fn(),
				update: jest.fn(),
				destroy: jest.fn(),
				count: jest.fn(),
			})
		),
		model: jest.fn(),
		models: {},
		sync: jest.fn().mockResolvedValue(true),
		transaction: jest.fn().mockImplementation((fn: () => unknown) => fn()),
		close: jest.fn().mockResolvedValue(true),
	};

	// Return a safely typed mock object
	const mockExports = {
		Sequelize: jest.fn(() => mockSequelize),
		DataTypes: {
			STRING: 'STRING',
			INTEGER: 'INTEGER',
			BOOLEAN: 'BOOLEAN',
			DATE: 'DATE',
			UUID: 'UUID',
			UUIDV4: 'UUIDV4',
			TEXT: 'TEXT',
			JSONB: 'JSONB',
			ENUM: jest.fn((values: string[]) => ({ type: 'ENUM', values })),
			ARRAY: jest.fn((type: unknown) => ({ type: 'ARRAY', of: type })),
			NOW: 'NOW',
		},
		Model: jest.fn(),
		Op: {
			and: 'and',
			or: 'or',
			eq: 'eq',
			ne: 'ne',
			gt: 'gt',
			gte: 'gte',
			lt: 'lt',
			lte: 'lte',
			like: 'like',
			iLike: 'iLike',
			in: 'in',
			notIn: 'notIn',
		},
	};

	return mockExports;
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
