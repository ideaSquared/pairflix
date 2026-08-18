import { AppLayout } from '@pairflix/components';
import React, { useEffect, useRef } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  createClientNavigation,
  createGuestNavigation,
} from '../../config/navigation';
import EmailVerificationPage from '../../features/auth/EmailVerificationPage';
import MockCheckout from '../../features/billing/MockCheckout';
import { isBillingMockEnabled } from '../../features/billing/flags';
import ForgotPasswordPage from '../../features/auth/ForgotPasswordPage';
import LoginPage from '../../features/auth/LoginPage';
import ProfilePage from '../../features/auth/ProfilePage';
import RegisterPage from '../../features/auth/RegisterPage';
import ResetPasswordPage from '../../features/auth/ResetPasswordPage';
import HistoryPage from '../../features/history/HistoryPage';
import AcceptInvitePage from '../../features/households/AcceptInvitePage';
import CreateHouseholdPage from '../../features/households/CreateHouseholdPage';
import InviteToHouseholdPage from '../../features/households/InviteToHouseholdPage';
import TasteOnboardingPage from '../../features/onboarding/TasteOnboardingPage';
import TonightPicker from '../../features/tonight/TonightPicker';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

const LogoutRoute: React.FC = () => {
  const { logout } = useAuth();
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    // Re-renders (e.g. the auth query settling) hand back a new `logout` reference, and
    // StrictMode double-invokes effects -- both would otherwise fire a second, concurrent
    // /api/auth/logout call that can 403 by racing the first call's CSRF cookie.
    if (hasLoggedOut.current) return;
    hasLoggedOut.current = true;
    logout();
  }, [logout]);

  return <div>Logging out...</div>;
};

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const defaultPath = '/tonight';

  const handleLogout = () => {
    logout();
  };

  // Map AuthUser to the format expected by navigation config
  const userForNav = user
    ? {
        name: user.username,
        id: user.id,
      }
    : undefined;

  const navigationConfig = isAuthenticated
    ? createClientNavigation(userForNav, handleLogout)
    : createGuestNavigation();

  return (
    <Routes>
      {/* Login and register pages without layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Email-related pages without layout */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />

      {/* Logout route */}
      <Route path="/logout" element={<LogoutRoute />} />

      {/* Protected routes with AppLayout */}
      <Route
        path="/*"
        element={
          <AppLayout variant="client" navigation={navigationConfig}>
            <Routes>
              <Route
                path="/tonight"
                element={<ProtectedRoute element={<TonightPicker />} />}
              />
              <Route
                path="/history"
                element={<ProtectedRoute element={<HistoryPage />} />}
              />
              <Route
                path="/households/new"
                element={<ProtectedRoute element={<CreateHouseholdPage />} />}
              />
              <Route
                path="/households/:id/invites"
                element={<ProtectedRoute element={<InviteToHouseholdPage />} />}
              />
              <Route
                path="/household-invites/:token"
                element={<ProtectedRoute element={<AcceptInvitePage />} />}
              />
              <Route
                path="/onboarding/taste"
                element={<ProtectedRoute element={<TasteOnboardingPage />} />}
              />
              <Route
                path="/profile"
                element={<ProtectedRoute element={<ProfilePage />} />}
              />
              {isBillingMockEnabled() && (
                <Route
                  path="/billing/mock-checkout"
                  element={<ProtectedRoute element={<MockCheckout />} />}
                />
              )}

              {/* Default route */}
              <Route path="/" element={<Navigate to={defaultPath} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AppLayout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
