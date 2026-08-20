import type { PickRequest, RecommendationResult } from './households';
import { fetchWithAuth } from './utils';

// A visitor with no account can still be carrying a `csrfToken` or `session` cookie (a prior
// login, a prior visit to /login/register, a leftover dev session) -- fetch's default
// credentials mode sends those on any same-origin request regardless of auth state, which trips
// the API's csrfMiddleware if the header isn't attached. `fetchWithAuth` always seeds a fresh
// CSRF token before a mutating call for exactly this reason (see csrfMiddleware's doc comment);
// this endpoint isn't actually exempt from that just because it doesn't require a session.
export const demo = {
  pick: (body: PickRequest): Promise<RecommendationResult> =>
    fetchWithAuth('/api/demo/pick', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
