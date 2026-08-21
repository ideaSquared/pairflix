import { describe, expect, it } from 'vitest';
import { isUniqueConstraintViolation } from './dbErrors';

describe('isUniqueConstraintViolation', () => {
	it('detects the constraint text on the error itself', () => {
		expect(
			isUniqueConstraintViolation(
				new Error('UNIQUE constraint failed: users.username')
			)
		).toBe(true);
	});

	it('walks the .cause chain the way Drizzle wraps D1 errors', () => {
		// Drizzle's own message is just "Failed query: ..."; the real SQLite text is nested.
		const wrapped = new Error('Failed query: insert into users', {
			cause: new Error('D1_ERROR', {
				cause: new Error(
					'UNIQUE constraint failed: users.email: SQLITE_CONSTRAINT'
				),
			}),
		});
		expect(isUniqueConstraintViolation(wrapped)).toBe(true);
	});

	it('returns false for unrelated errors and non-error values', () => {
		expect(isUniqueConstraintViolation(new Error('NOT NULL constraint'))).toBe(
			false
		);
		expect(
			isUniqueConstraintViolation(
				new Error('outer', { cause: new Error('some other failure') })
			)
		).toBe(false);
		expect(isUniqueConstraintViolation('UNIQUE constraint failed')).toBe(false);
		expect(isUniqueConstraintViolation(null)).toBe(false);
		expect(isUniqueConstraintViolation(undefined)).toBe(false);
	});
});
