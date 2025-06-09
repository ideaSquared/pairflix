import { activity } from './activity';
import { admin } from './admin';
import { auth } from './auth';
import { matches } from './matches';
import { search } from './search';
import { user } from './user';
import { fetchWithAuth } from './utils';
import { watchlist } from './watchlist';

// Re-export the Activity type from activity
export type { Activity } from './activity';

// Re-export types from admin
export type { AppSettings } from './admin';

// Export individual services
export {
  activity,
  admin,
  auth,
  fetchWithAuth,
  matches,
  search,
  user,
  watchlist,
};

// Export types from utils
export * from './utils';

// Create and export a default api object that combines all services
const api = {
  auth,
  user,
  search,
  watchlist,
  matches,
  activity,
  admin,
};

export default api;
