// Shared helpers for the local-D1 dev seed scripts (seed-dev-users.mjs, seed-dev-households.mjs).
// --local only -- callers must never point this at a real D1 database.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const ITERATIONS = 100_000; // must match services/api/src/lib/crypto.ts

const encoder = new TextEncoder();
const toBase64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));

export const hashPassword = async password => {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
		key,
		256
	);
	return `pbkdf2$${ITERATIONS}$${toBase64(salt.buffer)}$${toBase64(bits)}`;
};

export const sqlString = value => `'${value.replace(/'/g, "''")}'`;

/** Runs a batch of SQL statements against local D1 via a temp file (wrangler has no
 * multi-statement inline `--command` mode). */
export const runD1File = (statements, label) => {
	const dir = mkdtempSync(join(tmpdir(), 'pairflix-seed-'));
	const sqlFile = join(dir, `${label}.sql`);
	writeFileSync(sqlFile, statements.join('\n'));

	try {
		execFileSync(
			'pnpm',
			[
				'exec',
				'wrangler',
				'd1',
				'execute',
				'pairflix-db',
				'--local',
				`--file=${sqlFile}`,
			],
			{
				stdio: 'inherit',
				shell: true,
			}
		);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
};
