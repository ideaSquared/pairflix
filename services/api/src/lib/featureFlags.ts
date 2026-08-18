import { settings, type Database } from '@pairflix/db';
import { eq } from 'drizzle-orm';
import { getEntitlements } from './entitlements';

/** Reads `settings` directly on every call rather than caching -- unlike the current Express
 * process, a Worker isolate doesn't reliably live long enough for an in-memory TTL cache to pay
 * for itself, and a `settings` read is a single indexed row lookup. */
export const isLlmRerankEnabled = async (db: Database): Promise<boolean> => {
	const row = await db
		.select({ value: settings.value })
		.from(settings)
		.where(eq(settings.key, 'recommendation.llm_rerank'))
		.get();
	return typeof row?.value === 'boolean' ? row.value : false;
};

export const isLlmRerankEnabledForHousehold = async (
	db: Database,
	householdId: string
): Promise<boolean> => {
	if (!(await isLlmRerankEnabled(db))) return false;
	const entitlements = await getEntitlements(db, householdId);
	return entitlements.canUseLlmRerank;
};
