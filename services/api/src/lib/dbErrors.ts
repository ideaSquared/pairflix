// Drizzle wraps the D1 driver's rejection in a DrizzleQueryError whose own .message is just "Failed
// query: ..." -- the actual "UNIQUE constraint failed: users.username: SQLITE_CONSTRAINT" text is
// on a nested .cause (D1's error wraps the raw SQLite one), so this walks the chain instead of
// checking .message directly.
export const isUniqueConstraintViolation = (error: unknown): boolean =>
	error instanceof Error &&
	(error.message.includes('UNIQUE constraint failed') ||
		isUniqueConstraintViolation(error.cause));
