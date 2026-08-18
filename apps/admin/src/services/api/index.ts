// Core admin API functionalities
import { admin } from './admin';
import { auth } from './auth';
import { twoFactor } from './twoFactor';
import { fetchWithAuth } from './utils';

// Export type definitions
export type * from './admin';
export type * from './auth';
export type * from './utils';

// Export core functionalities
export { admin, auth, twoFactor, fetchWithAuth };

// Default export of the complete API surface
const api = {
  admin,
  auth,
  twoFactor,
} as const;

export default api;
