import { auditLogs, type Database } from '@pairflix/db';
import { newId } from './id';

/**
 * Generic leveled application logging -- backs the admin audit-log viewer. Distinct from
 * creatorgrid's own `auditLog`, which is specifically a record of admin moderation actions
 * (actor/target/action); this ports pairflix's existing `audit.service.ts` shape instead (see
 * docs/db-schema.md's "Admin: audit log & settings" section for why).
 *
 * Never throws -- a broken audit log must never break the request that triggered it.
 */
const log = async (
	db: Database,
	level: 'info' | 'warn' | 'error' | 'debug',
	message: string,
	source: string,
	context?: Record<string, unknown>
): Promise<void> => {
	try {
		await db.insert(auditLogs).values({
			id: newId('audit'),
			level,
			message,
			source,
			context: context ?? {},
			createdAt: new Date(),
		});
	} catch (error) {
		console.error('Failed to create audit log:', error);
	}
};

export const auditInfo = (
	db: Database,
	message: string,
	source: string,
	context?: Record<string, unknown>
): Promise<void> => log(db, 'info', message, source, context);

export const auditWarn = (
	db: Database,
	message: string,
	source: string,
	context?: Record<string, unknown>
): Promise<void> => log(db, 'warn', message, source, context);

export const auditError = (
	db: Database,
	message: string,
	source: string,
	context?: Record<string, unknown>
): Promise<void> => log(db, 'error', message, source, context);
