import AuditLog from '../models/AuditLog';
import { auditLogService, LogLevel } from './audit.service';

// Mock AuditLog model
jest.mock('../models/AuditLog', () => {
	return {
		default: {
			create: jest.fn(),
			findAll: jest.fn(),
		},
	};
});

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

			console.error = jest.fn(); // Mock console.error

			const result = await auditLogService.log(
				LogLevel.ERROR,
				'Error message',
				'error-source'
			);

			expect(AuditLog.create).toHaveBeenCalled();
			expect(console.error).toHaveBeenCalled();
			expect(result).toBeNull();
		});
	});

	describe('convenience methods', () => {
		it('should use the correct log level for info()', async () => {
			const spy = jest.spyOn(auditLogService, 'log');
			await auditLogService.info('Info message', 'test-source', { data: 123 });
			expect(spy).toHaveBeenCalledWith(
				LogLevel.INFO,
				'Info message',
				'test-source',
				{ data: 123 }
			);
		});

		it('should use the correct log level for warn()', async () => {
			const spy = jest.spyOn(auditLogService, 'log');
			await auditLogService.warn('Warning message', 'test-source');
			expect(spy).toHaveBeenCalledWith(
				LogLevel.WARN,
				'Warning message',
				'test-source',
				undefined
			);
		});

		it('should use the correct log level for error()', async () => {
			const spy = jest.spyOn(auditLogService, 'log');
			await auditLogService.error('Error message', 'test-source');
			expect(spy).toHaveBeenCalledWith(
				LogLevel.ERROR,
				'Error message',
				'test-source',
				undefined
			);
		});

		it('should use the correct log level for debug() in development', async () => {
			const spy = jest.spyOn(auditLogService, 'log');
			process.env.NODE_ENV = 'development';
			await auditLogService.debug('Debug message', 'test-source');
			expect(spy).toHaveBeenCalledWith(
				LogLevel.DEBUG,
				'Debug message',
				'test-source',
				undefined
			);
		});

		it('should not log debug messages in production', async () => {
			const spy = jest.spyOn(auditLogService, 'log');
			process.env.NODE_ENV = 'production';
			const result = await auditLogService.debug(
				'Debug message',
				'test-source'
			);
			expect(spy).not.toHaveBeenCalled();
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
