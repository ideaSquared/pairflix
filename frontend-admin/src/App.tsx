import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './components/auth/AdminRoute';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ActivityManagementPage } from './features/admin/activity/ActivityManagementPage';
import { AuditLogsPage } from './features/admin/activity/AuditLogsPage';
import { ContentModerationPage } from './features/admin/content/ContentModerationPage';
import { DashboardPage } from './features/admin/dashboard/DashboardPage';
import { SystemMonitoringPage } from './features/admin/monitoring/SystemMonitoringPage';
import { SystemStatsPage } from './features/admin/monitoring/SystemStatsPage';
import { SettingsPage } from './features/admin/settings/SettingsPage';
import { UsersPage } from './features/admin/users/UsersPage';
import { AdminLoginPage } from './features/auth/AdminLoginPage';
import { AdminLayout } from './features/layouts/AdminLayout';

// Create a new QueryClient for API requests - removing as we now have it in main.tsx
// const queryClient = new QueryClient({
// 	defaultOptions: {
// 		queries: {
// 			staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
// 			cacheTime: 1000 * 60 * 30, // Cache is kept for 30 minutes
// 			refetchOnWindowFocus: false,
// 			retry: (failureCount, error) => {
// 				// Don't retry on 401/403 errors
// 				if (
// 					error instanceof Error &&
// 					error.message.includes('Authentication required')
// 				) {
// 					return false;
// 				}
// 				// Retry up to 3 times for other errors
// 				return failureCount < 3;
// 			},
// 		},
// 	},
// });

function App() {
	return (
		<AdminAuthProvider>
			<Routes>
				<Route path='/login' element={<AdminLoginPage />} />

				{/* Protected admin routes */}
				<Route path='/admin' element={<AdminRoute element={<AdminLayout />} />}>
					<Route index element={<DashboardPage />} />
					<Route path='users' element={<UsersPage />} />
					<Route path='content' element={<ContentModerationPage />} />
					<Route path='activity' element={<ActivityManagementPage />} />
					<Route path='logs' element={<AuditLogsPage />} />
					<Route path='monitoring' element={<SystemMonitoringPage />} />
					<Route path='stats' element={<SystemStatsPage />} />
					<Route path='settings' element={<SettingsPage />} />
				</Route>

				{/* Redirect root to admin dashboard */}
				<Route path='/' element={<Navigate to='/admin' replace />} />
				<Route path='*' element={<Navigate to='/admin' replace />} />
			</Routes>
		</AdminAuthProvider>
	);
}

export default App;
