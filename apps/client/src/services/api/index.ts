import { auth } from './auth';
import { billing } from './billing';
import { emailService } from './email';
import { history } from './history';
import { households } from './households';
import { user } from './user';
import { fetchWithAuth } from './utils';

// Re-export types from auth
export type { AuthUser, LoginCredentials } from './auth';

// Re-export types from history
export type { HistoryEntry, HistoryResponse } from './history';

// Re-export types from user
export type { EmailUpdate, PasswordUpdate } from './user';

// Re-export types from billing
export type {
  CheckoutSession,
  Entitlements,
  SubscriptionTier,
} from './billing';

// Export individual services
export {
  auth,
  billing,
  emailService,
  fetchWithAuth,
  history,
  households,
  user,
};

// Export types from utils
export * from './utils';

// Create and export a default api object that combines all services
const api = {
  auth,
  user,
  billing,
  email: emailService,
  history,
  households,
};

export default api;
