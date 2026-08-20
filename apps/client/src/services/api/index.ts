import { auth } from './auth';
import { billing } from './billing';
import { demo } from './demo';
import { emailService } from './email';
import { history } from './history';
import { households } from './households';
import { tasteOnboarding } from './tasteOnboarding';
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

// Re-export types from tasteOnboarding
export type {
  OnboardingCard,
  OnboardingSubmission,
  OnboardingSwipe,
} from './tasteOnboarding';

// Export individual services
export {
  auth,
  billing,
  demo,
  emailService,
  fetchWithAuth,
  history,
  households,
  tasteOnboarding,
  user,
};

// Export types from utils
export * from './utils';

// Create and export a default api object that combines all services
const api = {
  auth,
  user,
  billing,
  demo,
  email: emailService,
  history,
  households,
  tasteOnboarding,
};

export default api;
