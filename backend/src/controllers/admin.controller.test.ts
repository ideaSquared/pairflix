import { auditLogService } from '../services/audit.service';
import { mockRequest, mockResponse } from '../tests/controller-helpers';
import {
	createTestLog,
	getAuditLogs,
	getAuditLogsByLevel,
} from './admin.controller';

// Mock the audit service
jest.mock('../services/audit.service', () => ({
	auditLogService: {
		getRecentLogs: jest.fn(),
		getLogsByLevel: jest.fn(),
		log: jest.fn(),
	},
	LogLevel: {
		INFO: 'info',
		WARN: 'warn',
		ERROR: 'error',
		DEBUG: 'debug',
	},
}));

describe('AdminController', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getAuditLogs', () => {
		it('should return audit logs successfully', async () => {
			// Arrange
			const req = mockRequest({
				query: { limit: '10', offset: '0' },
			});
			const res = mockResponse();

			const mockLogs = [
				{
					log_id: '1',
					level: 'info',
					message: 'Test log',
					created_at: new Date(),
				},
				{
					log_id: '2',
					level: 'error',
					message: 'Error log',
					created_at: new Date(),
				},
			];

			(auditLogService.getRecentLogs as jest.Mock).mockResolvedValue(mockLogs);

			// Act
			await getAuditLogs(req, res);

			// Assert
			expect(auditLogService.getRecentLogs).toHaveBeenCalledWith(10, 0);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ data: mockLogs });
		});

		it('should handle errors', async () => {
			// Arrange
			const req = mockRequest();
			const res = mockResponse();

			(auditLogService.getRecentLogs as jest.Mock).mockRejectedValue(
				new Error('Database error')
			);

			console.error = jest.fn(); // Mock console.error

			// Act
			await getAuditLogs(req, res);

			// Assert
			expect(console.error).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Failed to fetch audit logs',
			});
		});
	});

	describe('getAuditLogsByLevel', () => {
		it('should return logs filtered by level', async () => {
			// Arrange
			const req = mockRequest({
				params: { level: 'error' },
				query: { limit: '20', offset: '10' },
			});
			const res = mockResponse();

			const mockLogs = [
				{
					log_id: '1',
					level: 'error',
					message: 'Error 1',
					created_at: new Date(),
				},
				{
					log_id: '2',
					level: 'error',
					message: 'Error 2',
					created_at: new Date(),
				},
			];

			(auditLogService.getLogsByLevel as jest.Mock).mockResolvedValue(mockLogs);

			// Act
			await getAuditLogsByLevel(req, res);

			// Assert
			expect(auditLogService.getLogsByLevel).toHaveBeenCalledWith(
				'error',
				20,
				10
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ data: mockLogs });
		});

		it('should return 400 for invalid log level', async () => {
			// Arrange
			const req = mockRequest({
				params: { level: 'invalid_level' },
			});
			const res = mockResponse();

			// Act
			await getAuditLogsByLevel(req, res);

			// Assert
			expect(auditLogService.getLogsByLevel).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Invalid log level',
				validLevels: ['info', 'warn', 'error', 'debug'],
			});
		});

		it('should handle errors', async () => {
			// Arrange
			const req = mockRequest({
				params: { level: 'error' },
			});
			const res = mockResponse();

			(auditLogService.getLogsByLevel as jest.Mock).mockRejectedValue(
				new Error('Database error')
			);

			console.error = jest.fn(); // Mock console.error

			// Act
			await getAuditLogsByLevel(req, res);

			// Assert
			expect(console.error).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Failed to fetch audit logs',
			});
		});
	});

	describe('createTestLog', () => {
		it('should create a test log entry', async () => {
			// Arrange
			const req = mockRequest({
				body: {
					level: 'info',
					message: 'Test message',
				},
				user: {
					user_id: 'test-user',
					email: 'test@example.com',
					username: 'testuser',
					role: 'admin',
					status: 'active' as 'active' | 'inactive' | 'pending' | 'suspended',
					preferences: {
						theme: 'light' as const,
						viewStyle: 'list' as const,
						emailNotifications: true,
						autoArchiveDays: 30,
						favoriteGenres: ['action', 'comedy'],
					},
				},
			});
			const res = mockResponse();

			const mockLog = {
				log_id: '123',
				level: 'info',
				message: 'Test message',
				source: 'admin-test',
				created_at: new Date(),
			};

			(auditLogService.log as jest.Mock).mockResolvedValue(mockLog);

			// Act
			await createTestLog(req, res);

			// Assert
			expect(auditLogService.log).toHaveBeenCalledWith(
				'info',
				'Test message',
				'admin-test',
				expect.objectContaining({
					testMode: true,
					userId: 'test-user',
				})
			);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({ log: mockLog });
		});

		it('should return 400 when required fields are missing', async () => {
			// Arrange - missing message
			const req1 = mockRequest({
				body: { level: 'info' },
			});
			const res1 = mockResponse();

			// Act
			await createTestLog(req1, res1);

			// Assert
			expect(auditLogService.log).not.toHaveBeenCalled();
			expect(res1.status).toHaveBeenCalledWith(400);
			expect(res1.json).toHaveBeenCalledWith({
				error: 'Level and message are required',
			});

			// Arrange - missing level
			const req2 = mockRequest({
				body: { message: 'Test message' },
			});
			const res2 = mockResponse();

			// Act
			await createTestLog(req2, res2);

			// Assert
			expect(auditLogService.log).not.toHaveBeenCalled();
			expect(res2.status).toHaveBeenCalledWith(400);
			expect(res2.json).toHaveBeenCalledWith({
				error: 'Level and message are required',
			});
		});

		it('should return 400 for invalid log level', async () => {
			// Arrange
			const req = mockRequest({
				body: {
					level: 'invalid_level',
					message: 'Test message',
				},
			});
			const res = mockResponse();

			// Act
			await createTestLog(req, res);

			// Assert
			expect(auditLogService.log).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Invalid log level',
				validLevels: ['info', 'warn', 'error', 'debug'],
			});
		});

		it('should handle errors', async () => {
			// Arrange
			const req = mockRequest({
				body: {
					level: 'info',
					message: 'Test message',
				},
			});
			const res = mockResponse();

			(auditLogService.log as jest.Mock).mockRejectedValue(
				new Error('Database error')
			);

			console.error = jest.fn(); // Mock console.error

			// Act
			await createTestLog(req, res);

			// Assert
			expect(console.error).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Failed to create test log',
			});
		});
	});
});
