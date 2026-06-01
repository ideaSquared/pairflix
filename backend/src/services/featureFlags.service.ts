// TODO: replace on merge with Phase C's full featureFlags service.
import { getEntitlements } from './entitlements.service';

/**
 * Global LLM rerank flag. In Phase C this is driven by AppSettings.
 */
export function isLlmRerankEnabled(): boolean {
	return process.env.LLM_RERANK_ENABLED === 'true';
}

/**
 * Household-scoped LLM rerank gate. ANDs the global flag with the
 * household's tier entitlement.
 */
export async function isLlmRerankEnabledForHousehold(
	householdId: string
): Promise<boolean> {
	if (!isLlmRerankEnabled()) return false;
	const entitlements = await getEntitlements(householdId);
	return entitlements.can_use_llm_rerank;
}
