import { admin } from './admin';
import { auth } from './auth';
import { matches } from './matches';
import { search } from './search';
import { user } from './user';
import { fetchWithAuth } from './utils';
import { watchlist } from './watchlist';

// Re-export the AppSettings type from admin
export type { AppSettings } from './admin';

// Export individual services
export { admin, auth, fetchWithAuth, matches, search, user, watchlist };

// Export types from utils
export * from './utils';

// Create and export a default api object that combines all services
const api = {
	auth,
	user,
	search,
	watchlist,
	matches,
	admin,
};

export default api;
