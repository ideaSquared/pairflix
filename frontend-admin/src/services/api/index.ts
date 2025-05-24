import { admin } from './admin';
import { auth } from './auth';
import { fetchWithAuth } from './utils';

// Re-export the AppSettings type from admin
export type { AppSettings } from './admin';

// Export individual services
export { admin, auth, fetchWithAuth };

// Export types from utils
export * from './utils';

// Create and export a default api object that combines all services
const api = {
	auth,
	admin,
};

export default api;
