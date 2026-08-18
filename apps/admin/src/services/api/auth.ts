import { fetchWithAuth } from './utils';

export interface LoginCredentials {
  email: string;
  password: string;
  totpCode?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
  emailVerified: boolean;
  totpEnabled: boolean;
  createdAt: string;
}

// Admins authenticate through the same session-cookie flow as apps/client (no separate
// /api/admin/login) -- requireAdmin (services/api/src/middleware/auth.ts) then gates every
// /api/admin/* route on role === 'admin' AND totpEnabled, regardless of how the caller logged in.
export const auth = {
  login: async (
    credentials: LoginCredentials
  ): Promise<{ id: string; username: string; email: string }> => {
    const response = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<AdminUser> => {
    const response = await fetchWithAuth('/api/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await fetchWithAuth('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },
};
