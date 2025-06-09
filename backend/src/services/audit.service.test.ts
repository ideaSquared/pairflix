// Define mock return type for AuditLog
interface MockAuditLog {
	log_id: string;
	level: string;
	message: string;
	source: string;
	context: Record<string, unknown> | null;
	created_at: Date;
}

// Create mock functions first
const mockAuditLogCreate = jest.fn();
const mockAuditLogFindAll = jest.fn();
const mockAuditLogDestroy = jest.fn();
const mockAuditLogCount = jest.fn();
const mockAuditLogFindOne = jest.fn();

// Mock AuditLog model
const mockAuditLog = {
	create: mockAuditLogCreate,
	findAll: mockAuditLogFindAll,
	destroy: mockAuditLogDestroy,
	count: mockAuditLogCount,
	findOne: mockAuditLogFindOne,
};

jest.mock('../models/AuditLog', () => ({
	__esModule: true,
	default: mockAuditLog,
}));

import { auditLogService, LogLevel } from './audit.service';

describe('AuditLogService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Mock NODE_ENV for testing
		process.env.NODE_ENV = 'development';
	});

	describe('log', () => {
		it('should create a log entry with the specified level, message, and source', async () => {
			const mockLog: MockAuditLog = {
				log_id: '123',
				level: 'info',
				message: 'Test message',
				source: 'test-service',
				context: { test: true },
				created_at: new Date(),
			};

			mockAuditLogCreate.mockResolvedValue(mockLog);

			const result = await auditLogService.log(
				LogLevel.INFO,
				'Test message',
				'test-service',
				{ test: true }
			);

			expect(mockAuditLogCreate).toHaveBeenCalledWith({
				level: 'info',
				message: 'Test message',
				source: 'test-service',
				context: { test: true },
			});
			expect(result).toEqual(mockLog);
		});

		it('should handle errors without throwing', async () => {
			mockAuditLogCreate.mockRejectedValue(new Error('Database error'));

			// Mock console.error
			const originalConsoleError = console.error;
			console.error = jest.fn();

			const result = await auditLogService.log(
				LogLevel.ERROR,
				'Error message',
				'error-source'
			);

			expect(mockAuditLogCreate).toHaveBeenCalled();
			expect(console.error).toHaveBeenCalled();
			expect(result).toBeNull();

			// Restore console.error
			console.error = originalConsoleError;
		});
	});

	describe('convenience methods', () => {
		beforeEach(() => {
			// Reset the mock for each test
			mockAuditLogCreate.mockClear();
		});

		it('should use the correct log level for info()', async () => {
			const mockLog = {
				log_id: 'test123',
				level: 'info',
				message: 'Info message',
				source: 'test-source',
				context: { data: 123 },
				created_at: new Date(),
			};

			mockAuditLogCreate.mockResolvedValue(mockLog);

			const result = await auditLogService.info('Info message', 'test-source', {
				data: 123,
			});

			expect(mockAuditLogCreate).toHaveBeenCalledWith({
				level: 'info',
				message: 'Info message',
				source: 'test-source',
				context: { data: 123 },
			});
			expect(result).toEqual(mockLog);
		});

		it('should use the correct log level for warn()', async () => {
			const mockLog = {
				log_id: 'test123',
				level: 'warn',
				message: 'Warning message',
				source: 'test-source',
				context: {},
				created_at: new Date(),
			};

			mockAuditLogCreate.mockResolvedValue(mockLog);

			const result = await auditLogService.warn(
				'Warning message',
				'test-source'
			);

			expect(mockAuditLogCreate).toHaveBeenCalledWith({
				level: 'warn',
				message: 'Warning message',
				source: 'test-source',
				context: {},
			});
			expect(result).toEqual(mockLog);
		});

		it('should use the correct log level for error()', async () => {
			const mockLog = {
				log_id: 'test123',
				level: 'error',
				message: 'Error message',
				source: 'test-source',
				context: {},
				created_at: new Date(),
			};

			mockAuditLogCreate.mockResolvedValue(mockLog);

			const result = await auditLogService.error(
				'Error message',
				'test-source'
			);

			expect(mockAuditLogCreate).toHaveBeenCalledWith({
				level: 'error',
				message: 'Error message',
				source: 'test-source',
				context: {},
			});
			expect(result).toEqual(mockLog);
		});

		it('should use the correct log level for debug() in development', async () => {
			process.env.NODE_ENV = 'development';

			const mockLog = {
				log_id: 'test123',
				level: 'debug',
				message: 'Debug message',
				source: 'test-source',
				context: {},
				created_at: new Date(),
			};

			mockAuditLogCreate.mockResolvedValue(mockLog);

			const result = await auditLogService.debug(
				'Debug message',
				'test-source'
			);

			expect(mockAuditLogCreate).toHaveBeenCalledWith({
				level: 'debug',
				message: 'Debug message',
				source: 'test-source',
				context: {},
			});
			expect(result).toEqual(mockLog);
		});

		it('should not log debug messages in production', async () => {
			process.env.NODE_ENV = 'production';
			const result = await auditLogService.debug(
				'Debug message',
				'test-source'
			);

			expect(mockAuditLogCreate).not.toHaveBeenCalled();
			expect(result).toBeNull();
		});
	});

	describe('query methods', () => {
		it('should fetch recent logs with proper ordering', async () => {
			const mockLogs: MockAuditLog[] = [
				{
					log_id: '1',
					created_at: new Date(),
					level: 'info',
					message: 'Test 1',
					source: 'test',
					context: null,
				},
				{
					log_id: '2',
					created_at: new Date(),
					level: 'error',
					message: 'Test 2',
					source: 'test',
					context: null,
				},
			];

			mockAuditLogFindAll.mockResolvedValue(mockLogs);

			const result = await auditLogService.getRecentLogs(10, 0);

			expect(mockAuditLogFindAll).toHaveBeenCalledWith({
				order: [['created_at', 'DESC']],
				limit: 10,
				offset: 0,
			});
			expect(result).toEqual(mockLogs);
		});

		it('should fetch logs filtered by level', async () => {
			const mockLogs: MockAuditLog[] = [
				{
					log_id: '1',
					created_at: new Date(),
					level: 'error',
					message: 'Error 1',
					source: 'test',
					context: null,
				},
				{
					log_id: '2',
					created_at: new Date(),
					level: 'error',
					message: 'Error 2',
					source: 'test',
					context: null,
				},
			];

			mockAuditLog.findAll.mockResolvedValue(mockLogs);

			const result = await auditLogService.getLogsByLevel(
				LogLevel.ERROR,
				10,
				0
			);

			expect(mockAuditLog.findAll).toHaveBeenCalledWith({
				where: { level: 'error' },
				order: [['created_at', 'DESC']],
				limit: 10,
				offset: 0,
			});
			expect(result).toEqual(mockLogs);
		});
	});
});
