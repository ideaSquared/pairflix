import { describe, expect, it } from 'vitest';

const routeModules = import.meta.glob<string>('./*.ts', {
	query: '?raw',
	import: 'default',
	eager: true,
});

// Splits a route module into one chunk per `xRoutes.<method>(` registration.
const routeChunks = (source: string): string[] =>
	source.split(/\n(?=\w+Routes\.(?:get|post|put|patch|delete)\()/).slice(1);

describe('routes that start a session', () => {
	it('every one mounts requireCsrfToken so a cookie-less cross-site POST cannot log the victim in', () => {
		const offenders = Object.entries(routeModules)
			.filter(([file]) => !file.includes('.test.'))
			.flatMap(([file, source]) =>
				routeChunks(source)
					.filter(chunk => chunk.includes('startSession('))
					.map(chunk => ({
						file,
						registration: chunk.split(/async\s/)[0] ?? '',
					}))
					.filter(
						({ registration }) => !registration.includes('requireCsrfToken')
					)
					.map(({ file, registration }) => `${file}: ${registration.trim()}`)
			);
		expect(offenders).toEqual([]);
	});
});
