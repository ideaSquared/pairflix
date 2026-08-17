import { fetchWithAuth, type UserPreferences } from './utils';

export interface LoginCredentials {
  email: string;
  password: string;
  totpCode?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
  emailVerified: boolean;
  totpEnabled: boolean;
  preferences: UserPreferences;
  createdAt: string;
}

export const auth = {
  register: async (
    credentials: RegisterCredentials
  ): Promise<{ id: string; username: string; email: string }> => {
    const response = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data;
  },

  login: async (
    credentials: LoginCredentials
  ): Promise<{ id: string; username: string; email: string }> => {
    const response = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await fetchWithAuth('/api/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      // Call the logout endpoint to record the event in audit logs
      await fetchWithAuth('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },
};
