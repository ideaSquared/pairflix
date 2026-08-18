import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import type { AdminUser } from '../services/api/auth';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<AdminUser | null>({
    queryKey: ['auth'],
    queryFn: api.auth.getCurrentUser,
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        error.message === 'Authentication required'
      ) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 60000, // Keep data in cache for 1 minute
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Stable references -- both are common useEffect deps, and a fresh function identity on every
  // render would re-fire those effects (see apps/client's useAuth for the bug this avoids).
  const logout = useCallback(async () => {
    // Call the server-side logout endpoint to record in audit logs
    await api.auth.logout();

    // Update local state
    queryClient.setQueryData(['auth'], null);
    queryClient.invalidateQueries();
    navigate('/login');
  }, [queryClient, navigate]);

  const checkAuth = useCallback(() => {
    // Debounce the auth check to prevent multiple calls
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      refreshTimeoutRef.current = null;
    }, 300);
  }, [queryClient]);

  const isAuthenticated = Boolean(user);

  return { user, isLoading, error, logout, checkAuth, isAuthenticated };
}

export default useAuth;
