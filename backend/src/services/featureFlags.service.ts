import { settingsService } from './settings.service';

const CACHE_TTL_MS = 60 * 1000;

interface CachedFlag {
	value: boolean;
	fetchedAt: number;
}

const flagCache: Map<string, CachedFlag> = new Map();

function envOverride(name: string): boolean | undefined {
	const raw = process.env[name];
	if (raw === undefined) return undefined;
	return raw.toLowerCase() === 'true';
}

async function readBoolSetting(
	key: string,
	envName: string,
	defaultValue: boolean
): Promise<boolean> {
	const now = Date.now();
	const cached = flagCache.get(key);
	if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
		return cached.value;
	}

	const env = envOverride(envName);
	let value: boolean;
	if (env !== undefined) {
		value = env;
	} else {
		try {
			const raw = await settingsService.getSetting(key, defaultValue);
			value = typeof raw === 'boolean' ? raw : defaultValue;
		} catch {
			value = defaultValue;
		}
	}

	flagCache.set(key, { value, fetchedAt: now });
	return value;
}

export async function isLlmRerankEnabled(): Promise<boolean> {
	return readBoolSetting(
		'recommendation.llm_rerank',
		'LLM_RERANK_ENABLED',
		false
	);
}

export function clearFeatureFlagCache(): void {
	flagCache.clear();
}

export const featureFlagsService = {
	isLlmRerankEnabled,
	clearFeatureFlagCache,
};
