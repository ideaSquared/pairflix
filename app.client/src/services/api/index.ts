import { activity } from './activity';
import { admin } from './admin';
import { auth } from './auth';
import { emailService } from './email';
import { matches } from './matches';
import { search } from './search';
import { user } from './user';
import { fetchWithAuth } from './utils';
import { watchlist } from './watchlist';

// Re-export the Activity type from activity
export type { Activity } from './activity';

// Re-export types from admin
export type { AppSettings } from './admin';

// Re-export types from auth
export type { LoginCredentials } from './auth';

// Re-export types from user
export type {
  EmailUpdate,
  PasswordUpdate,
  UpdateEmailResponse,
  UpdateUsernameResponse,
} from './user';

// Export individual services
export {
  activity,
  admin,
  auth,
  emailService,
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
  email: emailService,
};

export default api;
