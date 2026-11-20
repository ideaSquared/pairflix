/**
 * Where the `eng` CLI's ops endpoint is mounted. Shared by the router (`index.ts`) and the CSRF
 * exemption (`middleware/csrf.ts`) so the two cannot drift apart.
 */
export const OPS_BASE_PATH = '/api/ops';

/** True for `/api/ops` itself and anything beneath it, and nothing else (`/api/opsx` is not). */
export const isOpsPath = (path: string): boolean =>
	path === OPS_BASE_PATH || path.startsWith(`${OPS_BASE_PATH}/`);
