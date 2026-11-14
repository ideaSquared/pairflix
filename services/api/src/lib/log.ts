import { createLogger } from '@ideasquared/log';

export const log = createLogger({
	service: 'pairflix-api',
	fields: [
		'householdId',
		'tmdbId',
		'label',
		'status',
		'inputCount',
		'outputCount',
		'cacheReadCount',
		'cacheCreateCount',
	],
});
