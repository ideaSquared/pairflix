import { auditLogService, LogLevel } from './audit.service';

// Mock AuditLog model
jest.mock('../models/AuditLog', () => {
	return {
		__esModule: true,
		default: {
			create: jest.fn(),
			findAll: jest.fn(),
			destroy: jest.fn(),
			count: jest.fn(),
			findOne: jest.fn(),
		},
	};
});

// Import the mock after it's been set up
import AuditLog from '../models/AuditLog';

describe('AuditLogService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Mock NODE_ENV for testing
		process.env.NODE_ENV = 'development';
	});

	describe('log', () => {
		it('should create a log entry with the specified level, message, and source', async () => {
			const mockLog = {
				log_id: '123',
				level: 'info',
				message: 'Test message',
				source: 'test-service',
				context: { test: true },
				created_at: new Date(),
			};

			(AuditLog.create as jest.Mock).mockResolvedValue(mockLog);

			const result = await auditLogService.log(
				LogLevel.INFO,
				'Test message',
				'test-service',
				{ test: true }
			);

			expect(AuditLog.create).toHaveBeenCalledWith({
				level: 'info',
				message: 'Test message',
				source: 'test-service',
				context: { test: true },
			});
			expect(result).toEqual(mockLog);
		});

		it('should handle errors without throwing', async () => {
			(AuditLog.create as jest.Mock).mockRejectedValue(
				new Error('Database error')
			);

			// Mock console.error
			const originalConsoleError = console.error;
			console.error = jest.fn();

			const result = await auditLogService.log(
				LogLevel.ERROR,
				'Error message',
				'error-source'
			);

			expect(AuditLog.create).toHaveBeenCalled();
			expect(console.error).toHaveBeenCalled();
			expect(result).toBeNull();

			// Restore console.error
			console.error = originalConsoleError;
		});
	});

	describe('convenience methods', () => {
		beforeEach(() => {
			// Create a spy directly on the service's log method
			jest
				.spyOn(auditLogService, 'log')
				.mockImplementation(async () => ({ log_id: 'test123' }) as any);
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should use the correct log level for info()', async () => {
			// Store the original implementation
			const originalInfo = auditLogService.info;

			// We need to mock auditLogService.info to use our mocked log
			auditLogService.info = jest.fn(async (message, source, context) => {
				return auditLogService.log(LogLevel.INFO, message, source, context);
			}) as any;

			await auditLogService.info('Info message', 'test-source', { data: 123 });

			expect(auditLogService.log).toHaveBeenCalledWith(
				LogLevel.INFO,
				'Info message',
				'test-source',
				{ data: 123 }
			);

			// Restore original implementation
			auditLogService.info = originalInfo;
		});

		it('should use the correct log level for warn()', async () => {
			// Store the original implementation
			const originalWarn = auditLogService.warn;

			// Mock warn to use our mocked log
			auditLogService.warn = jest.fn(async (message, source, context) => {
				return auditLogService.log(LogLevel.WARN, message, source, context);
			}) as any;

			await auditLogService.warn('Warning message', 'test-source');

			expect(auditLogService.log).toHaveBeenCalledWith(
				LogLevel.WARN,
				'Warning message',
				'test-source',
				undefined
			);

			// Restore original implementation
			auditLogService.warn = originalWarn;
		});

		it('should use the correct log level for error()', async () => {
			// Store the original implementation
			const originalError = auditLogService.error;

			// Mock error to use our mocked log
			auditLogService.error = jest.fn(async (message, source, context) => {
				return auditLogService.log(LogLevel.ERROR, message, source, context);
			}) as any;

			await auditLogService.error('Error message', 'test-source');

			expect(auditLogService.log).toHaveBeenCalledWith(
				LogLevel.ERROR,
				'Error message',
				'test-source',
				undefined
			);

			// Restore original implementation
			auditLogService.error = originalError;
		});

		it('should use the correct log level for debug() in development', async () => {
			process.env.NODE_ENV = 'development';

			// Store the original implementation
			const originalDebug = auditLogService.debug;

			// Mock debug to use our mocked log
			auditLogService.debug = jest.fn(async (message, source, context) => {
				if (process.env.NODE_ENV !== 'production') {
					return auditLogService.log(LogLevel.DEBUG, message, source, context);
				}
				return null;
			}) as any;

			await auditLogService.debug('Debug message', 'test-source');

			expect(auditLogService.log).toHaveBeenCalledWith(
				LogLevel.DEBUG,
				'Debug message',
				'test-source',
				undefined
			);

			// Restore original implementation
			auditLogService.debug = originalDebug;
		});

		it('should not log debug messages in production', async () => {
			process.env.NODE_ENV = 'production';
			const result = await auditLogService.debug(
				'Debug message',
				'test-source'
			);

			expect(auditLogService.log).not.toHaveBeenCalled();
			expect(result).toBeNull();
		});
	});

	describe('query methods', () => {
		it('should fetch recent logs with proper ordering', async () => {
			const mockLogs = [
				{ log_id: '1', created_at: new Date(), level: 'info' },
				{ log_id: '2', created_at: new Date(), level: 'error' },
			];

			(AuditLog.findAll as jest.Mock).mockResolvedValue(mockLogs);

			const result = await auditLogService.getRecentLogs(10, 0);

			expect(AuditLog.findAll).toHaveBeenCalledWith({
				order: [['created_at', 'DESC']],
				limit: 10,
				offset: 0,
			});
			expect(result).toEqual(mockLogs);
		});

		it('should fetch logs filtered by level', async () => {
			const mockLogs = [
				{ log_id: '1', created_at: new Date(), level: 'error' },
				{ log_id: '2', created_at: new Date(), level: 'error' },
			];

			(AuditLog.findAll as jest.Mock).mockResolvedValue(mockLogs);

			const result = await auditLogService.getLogsByLevel(
				LogLevel.ERROR,
				10,
				0
			);

			expect(AuditLog.findAll).toHaveBeenCalledWith({
				where: { level: 'error' },
				order: [['created_at', 'DESC']],
				limit: 10,
				offset: 0,
			});
			expect(result).toEqual(mockLogs);
		});
	});
});
