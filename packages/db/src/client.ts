import type { D1Database } from '@cloudflare/workers-types';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema';

export type Database = DrizzleD1Database<typeof schema>;

/** Wrap a D1 binding in a typed Drizzle client. Call once per request in the Worker. */
export const createDb = (d1: D1Database): Database => drizzle(d1, { schema });
