import { fetchWithAuth } from './utils';

interface LoginCredentials {
  email: string;
  password: string;
}

export const auth = {
  login: async (credentials: LoginCredentials) => {
    const response = await fetch(
      `${(import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL || 'http://localhost:3000'}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Invalid email or password');
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },

  getCurrentUser: async () => {
    return fetchWithAuth('/api/auth/me');
  },

  logout: async () => {
    try {
      // Call the logout endpoint to record the event in audit logs
      await fetchWithAuth('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // If there's an error logging out, we still want to clear local storage
      console.error('Error logging out:', error);
    }
    // Remove token from localStorage regardless of server response
    localStorage.removeItem('token');
  },
};
