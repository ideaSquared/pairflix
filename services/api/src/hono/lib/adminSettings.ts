import { settings, type Database } from '@pairflix/db';

/** A nested object, e.g. { general: { siteName: 'Pairflix' }, recommendation: { llm_rerank: true } } --
 * compiled by splitting each row's dot-path `key` and building the nested structure. */
export type SettingsTree = Record<string, unknown>;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const setPath = (
	tree: SettingsTree,
	path: string[],
	value: unknown
): SettingsTree => {
	const [key, ...rest] = path;
	if (key === undefined) return tree;
	if (rest.length === 0) return { ...tree, [key]: value };
	const child = tree[key];
	return {
		...tree,
		[key]: setPath(isPlainObject(child) ? child : {}, rest, value),
	};
};

export const getSettings = async (db: Database): Promise<SettingsTree> => {
	const rows = await db.select().from(settings);
	return rows.reduce<SettingsTree>(
		(tree, row) => setPath(tree, row.key.split('.'), row.value),
		{}
	);
};

const flattenLeaves = (
	tree: SettingsTree,
	prefix: string[] = []
): { key: string; value: unknown }[] =>
	Object.entries(tree).flatMap(([segment, value]) => {
		const path = [...prefix, segment];
		return isPlainObject(value)
			? flattenLeaves(value, path)
			: [{ key: path.join('.'), value }];
	});

export const updateSettings = async (
	db: Database,
	patch: SettingsTree
): Promise<SettingsTree> => {
	const now = new Date();

	for (const { key, value } of flattenLeaves(patch)) {
		await db
			.insert(settings)
			.values({
				key,
				value,
				category: key.split('.')[0] ?? 'general',
				createdAt: now,
				updatedAt: now,
			})
			.onConflictDoUpdate({
				target: settings.key,
				set: { value, updatedAt: now },
			});
	}

	return getSettings(db);
};
