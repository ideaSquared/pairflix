import { AppLayout } from '@pairflix/components';
import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  createClientNavigation,
  createGuestNavigation,
} from '../../config/navigation';
import ActivityPage from '../../features/activity/ActivityPage';
import EmailVerificationPage from '../../features/auth/EmailVerificationPage';
import ForgotPasswordPage from '../../features/auth/ForgotPasswordPage';
import LoginPage from '../../features/auth/LoginPage';
import ProfilePage from '../../features/auth/ProfilePage';
import RegisterPage from '../../features/auth/RegisterPage';
import ResetPasswordPage from '../../features/auth/ResetPasswordPage';
import GroupsPage from '../../features/groups/pages/GroupsPage';
import WatchlistPage from '../../features/watchlist/WatchlistPage';
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

  useEffect(() => {
    logout();
  }, [logout]);

  return <div>Logging out...</div>;
};

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Map AuthUser to the format expected by navigation config
  const userForNav = user
    ? {
        name: user.username,
        id: user.user_id,
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
                path="/watchlist"
                element={<ProtectedRoute element={<WatchlistPage />} />}
              />
              <Route
                path="/groups"
                element={<ProtectedRoute element={<GroupsPage />} />}
              />
              <Route
                path="/groups/:groupId"
                element={<ProtectedRoute element={<GroupsPage />} />}
              />
              <Route
                path="/groups/create"
                element={<ProtectedRoute element={<GroupsPage />} />}
              />
              {/* Legacy redirect for old matches route */}
              <Route path="/matches" element={<Navigate to="/groups" />} />
              <Route
                path="/activity"
                element={<ProtectedRoute element={<ActivityPage />} />}
              />
              <Route
                path="/profile"
                element={<ProtectedRoute element={<ProfilePage />} />}
              />

              {/* Default route */}
              <Route path="/" element={<Navigate to="/watchlist" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AppLayout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
