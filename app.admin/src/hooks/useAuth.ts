import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { AdminUser } from '../services/api/auth';
import { ADMIN_TOKEN_KEY } from '../services/api/utils';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<AdminUser>({
    queryKey: ['auth'],
    queryFn: async () => {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        // Try to auto-refresh token if needed
        await api.auth.autoRefreshToken();

        // Get current user data
        return await api.auth.getCurrentUser();
      } catch (error) {
        console.error('Auth query error:', error);
        // Clear invalid tokens
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem('user');
        throw new Error('Authentication required');
      }
    },
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        (error.message === 'Authentication required' ||
          error.message === 'Session expired. Please login again.')
      ) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!localStorage.getItem(ADMIN_TOKEN_KEY),
  });

  // Auto-refresh token every 15 minutes
  useEffect(() => {
    if (user && localStorage.getItem(ADMIN_TOKEN_KEY)) {
      const refreshInterval = setInterval(
        async () => {
          try {
            await api.auth.autoRefreshToken();
            // Invalidate and refetch user data if token was refreshed
            queryClient.invalidateQueries(['auth']);
          } catch (error) {
            console.error('Auto refresh failed:', error);
            // Force logout on refresh failure
            await logout();
          }
        },
        15 * 60 * 1000
      ); // 15 minutes

      autoRefreshIntervalRef.current = refreshInterval;

      return () => {
        clearInterval(refreshInterval);
      };
    }
  }, [user, queryClient]);

  const logout = useCallback(async () => {
    try {
      // Clear auto-refresh interval
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
        autoRefreshIntervalRef.current = null;
      }

      // Call API logout
      await api.auth.logout();

      // Clear local state
      queryClient.setQueryData(['auth'], null);
      queryClient.clear();

      // Navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      queryClient.setQueryData(['auth'], null);
      queryClient.clear();
      navigate('/login');
    }
  }, [queryClient, navigate]);

  const checkAuth = useCallback(() => {
    // Debounce the auth check to prevent multiple calls
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(() => {
      // Force refetch of auth query to update authentication status
      queryClient.invalidateQueries(['auth']);
      queryClient.refetchQueries(['auth']);
      refreshTimeoutRef.current = null;
    }, 300);
  }, [queryClient]);

  // Manual refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const result = await api.auth.refreshToken();
      localStorage.setItem(ADMIN_TOKEN_KEY, result.token);

      // Update stored user data
      const userData = {
        user_id: result.user.id,
        email: result.user.email,
        username: result.user.name,
        role: result.user.role,
      };
      localStorage.setItem('user', JSON.stringify(userData));

      // Refresh query data
      queryClient.invalidateQueries(['auth']);

      return result;
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      await logout();
      throw error;
    }
  }, [queryClient, logout]);

  // Check token expiry status
  const isTokenNearExpiry = useCallback(() => {
    return api.auth.isTokenNearExpiry();
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, []);

  const isAuthenticated = Boolean(
    user && localStorage.getItem(ADMIN_TOKEN_KEY)
  );

  return {
    user,
    isLoading,
    error,
    logout,
    checkAuth,
    refreshToken,
    isTokenNearExpiry,
    isAuthenticated,
  };
}

export default useAuth;
