// filepath: c:\Users\thete\Desktop\localdev\pairflix\backend\src\utils\audit-transformer.test.ts
import type AuditLog from '../models/AuditLog';
import { LogLevel } from '../services/audit.service';
import { transformAuditLog } from './audit-transformer';

// Helper function to create a mock AuditLog
function createMockAuditLog(overrides: Partial<AuditLog>): AuditLog {
	return {
		log_id: 'default-id',
		level: LogLevel.INFO,
		message: 'default message',
		source: 'default-source',
		context: null,
		created_at: new Date(),
		...overrides,
	} as AuditLog;
}

describe('Audit Transformer Utility', () => {
	it('should transform ERROR level audit log correctly', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:00:00Z');
		const auditLog = createMockAuditLog({
			log_id: 'test-log-id-1',
			level: LogLevel.ERROR,
			message: 'Error occurred during authentication',
			source: 'auth-service',
			context: { userId: 'test-user', error: 'Invalid credentials' },
			created_at: timestamp,
		});

		// Act
		const transformed = transformAuditLog(auditLog);

		// Assert
		expect(transformed).toEqual({
			id: 'test-log-id-1',
			level: LogLevel.ERROR,
			levelClass: 'error',
			message: 'Error occurred during authentication',
			source: 'auth-service',
			context: { userId: 'test-user', error: 'Invalid credentials' },
			timestamp,
			formattedTimestamp: timestamp.toLocaleString(),
		});
	});

	it('should transform WARN level audit log correctly', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:01:00Z');
		const auditLog = createMockAuditLog({
			log_id: 'test-log-id-2',
			level: LogLevel.WARN,
			message: 'Rate limit exceeded',
			source: 'api-gateway',
			context: { ip: '192.168.1.1', endpoint: '/api/users' },
			created_at: timestamp,
		});

		// Act
		const transformed = transformAuditLog(auditLog);

		// Assert
		expect(transformed).toEqual({
			id: 'test-log-id-2',
			level: LogLevel.WARN,
			levelClass: 'warning',
			message: 'Rate limit exceeded',
			source: 'api-gateway',
			context: { ip: '192.168.1.1', endpoint: '/api/users' },
			timestamp,
			formattedTimestamp: timestamp.toLocaleString(),
		});
	});

	it('should transform INFO level audit log correctly', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:02:00Z');
		const auditLog = createMockAuditLog({
			log_id: 'test-log-id-3',
			level: LogLevel.INFO,
			message: 'User logged in',
			source: 'auth-service',
			context: { userId: 'test-user', ipAddress: '192.168.1.1' },
			created_at: timestamp,
		});

		// Act
		const transformed = transformAuditLog(auditLog);

		// Assert
		expect(transformed).toEqual({
			id: 'test-log-id-3',
			level: LogLevel.INFO,
			levelClass: 'info',
			message: 'User logged in',
			source: 'auth-service',
			context: { userId: 'test-user', ipAddress: '192.168.1.1' },
			timestamp,
			formattedTimestamp: timestamp.toLocaleString(),
		});
	});

	it('should transform DEBUG level audit log correctly', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:03:00Z');
		const auditLog = createMockAuditLog({
			log_id: 'test-log-id-4',
			level: LogLevel.DEBUG,
			message: 'Database query executed',
			source: 'database',
			context: { query: 'SELECT * FROM users', executionTime: '120ms' },
			created_at: timestamp,
		});

		// Act
		const transformed = transformAuditLog(auditLog);

		// Assert
		expect(transformed).toEqual({
			id: 'test-log-id-4',
			level: LogLevel.DEBUG,
			levelClass: 'debug',
			message: 'Database query executed',
			source: 'database',
			context: { query: 'SELECT * FROM users', executionTime: '120ms' },
			timestamp,
			formattedTimestamp: timestamp.toLocaleString(),
		});
	});

	it('should handle unknown log levels with default styling', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:04:00Z');
		const auditLog = createMockAuditLog({
			log_id: 'test-log-id-5',
			level: 'TRACE' as LogLevel, // Unknown level but properly typed
			message: 'Trace message',
			source: 'system',
			context: { detail: 'trace details' },
			created_at: timestamp,
		});

		// Act
		const transformed = transformAuditLog(auditLog);

		// Assert
		expect(transformed).toEqual({
			id: 'test-log-id-5',
			level: 'TRACE',
			levelClass: 'default',
			message: 'Trace message',
			source: 'system',
			context: { detail: 'trace details' },
			timestamp,
			formattedTimestamp: timestamp.toLocaleString(),
		});
	});

	it('should handle null context correctly', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:05:00Z');
		const auditLog = createMockAuditLog({
			log_id: 'test-log-id-6',
			level: LogLevel.INFO,
			message: 'Simple message with no context',
			source: 'test-service',
			context: null,
			created_at: timestamp,
		});

		// Act
		const transformed = transformAuditLog(auditLog);

		// Assert
		expect(transformed).toEqual({
			id: 'test-log-id-6',
			level: LogLevel.INFO,
			levelClass: 'info',
			message: 'Simple message with no context',
			source: 'test-service',
			context: null,
			timestamp,
			formattedTimestamp: timestamp.toLocaleString(),
		});
	});
});
