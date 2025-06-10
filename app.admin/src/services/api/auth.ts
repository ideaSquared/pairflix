/// <reference types="vite/client" />
import { ADMIN_TOKEN_KEY, BASE_URL } from './utils';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface AdminLoginParams {
  email: string;
  password: string;
}

export interface AdminUser {
  user_id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  last_login?: string;
  created_at?: string;
}

export interface RefreshTokenResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const auth = {
  async login(params: AdminLoginParams): Promise<LoginResponse> {
    const response = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Login failed');
    }

    return response.json();
  },

  async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (!token) {
        return false;
      }

      const response = await fetch(`${BASE_URL}/api/admin/validate-token`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log('Token validation failed:', response.status);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  async getCurrentUser(): Promise<AdminUser> {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/api/admin/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Clear invalid token
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem('user');
        throw new Error('Authentication required');
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user data');
    }

    return response.json();
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/api/admin/refresh-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Clear invalid token
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem('user');
        throw new Error('Authentication required');
      }
      const error = await response.json();
      throw new Error(error.error || 'Token refresh failed');
    }

    return response.json();
  },

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (token) {
        // Call server logout endpoint to log the event
        await fetch(`${BASE_URL}/api/admin/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      // Don't throw on logout errors - always clear local storage
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem('user');
    }
  },

  // Check if token is close to expiry (within 30 minutes)
  isTokenNearExpiry(): boolean {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) return true;

    try {
      // Decode JWT token to check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;

      return expiryTime - currentTime < thirtyMinutes;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true; // Assume expired if we can't decode
    }
  },

  // Automatically refresh token if it's near expiry
  async autoRefreshToken(): Promise<boolean> {
    try {
      if (this.isTokenNearExpiry()) {
        console.log('Token is near expiry, refreshing...');
        const refreshResult = await this.refreshToken();
        localStorage.setItem(ADMIN_TOKEN_KEY, refreshResult.token);

        // Update stored user data
        const userData = {
          user_id: refreshResult.user.id,
          email: refreshResult.user.email,
          username: refreshResult.user.name,
          role: refreshResult.user.role,
        };
        localStorage.setItem('user', JSON.stringify(userData));

        console.log('Token refreshed successfully');
        return true;
      }
      return false; // No refresh needed
    } catch (error) {
      console.error('Auto token refresh failed:', error);
      // Clear invalid tokens
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem('user');
      throw error;
    }
  },
};
