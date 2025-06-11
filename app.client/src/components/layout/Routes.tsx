import { AppLayout } from '@pairflix/components';
import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  createClientNavigation,
  createGuestNavigation,
} from '../../config/navigation';
import ActivityPage from '../../features/activity/ActivityPage';
import LoginPage from '../../features/auth/LoginPage';
import ProfilePage from '../../features/auth/ProfilePage';
import MatchPage from '../../features/match/MatchPage';
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
      {/* Login page without layout */}
      <Route path="/login" element={<LoginPage />} />

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
                path="/matches"
                element={<ProtectedRoute element={<MatchPage />} />}
              />
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
