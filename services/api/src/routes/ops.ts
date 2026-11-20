import { checkTeamMembership, createOpsHandler } from '@ideasquared/ops';
import { Hono } from 'hono';
import { log } from '../lib/log';
import { createOpsCommands } from '../ops/commands';
import { OPS_BASE_PATH } from '../ops/paths';
import type { AppEnv } from '../types';

/**
 * The `eng` CLI's ops endpoint (`@ideasquared/ops`, contract v1): `GET /catalog` and `POST /invoke`.
 *
 * Deliberately outside `requireAuth`/`requireAdmin`: the caller is a developer in the
 * `ideaSquared/pairflix` GitHub team (checked with their own token on every request), not a
 * browser session with TOTP. For the same reason it is exempt from CSRF (`middleware/csrf.ts`): it
 * never reads cookies, so there is no ambient credential to forge a request with. There is no KV
 * binding, so the access check is not cached and GitHub is asked each time.
 *
 * The handler is built per request because the commands close over this request's bindings.
 */
const OPS_TEAM = { org: 'ideaSquared', team: 'pairflix' };

export const opsRoutes = new Hono<AppEnv>();

opsRoutes.all('/*', c =>
	createOpsHandler({
		product: 'pairflix',
		authorize: (token, { fetch }) =>
			checkTeamMembership(token, OPS_TEAM, fetch),
		environment: c.env.ENVIRONMENT,
		commands: createOpsCommands({ env: c.env }),
		logger: log,
	})(c.req.raw, OPS_BASE_PATH)
);
