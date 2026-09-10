import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SESSION_EXPIRED_EVENT } from '../../services/api/utils';

/**
 * Central 401 handler -- fetchWithAuth dispatches SESSION_EXPIRED_EVENT whenever the API rejects
 * a request with "Authentication required". Reacting only when the ['auth'] query still has
 * cached user data tells an expired session (the visitor was signed in a moment ago) apart from
 * an anonymous visitor's very first, expected 401 on /api/auth/me -- which would otherwise bounce
 * the landing page straight to /login.
 */
const SessionExpiredHandler: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = () => {
      if (!queryClient.getQueryData(['auth'])) return;
      queryClient.clear();
      navigate('/login');
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [queryClient, navigate]);

  return null;
};

export default SessionExpiredHandler;
