// API configuration
export const API_BASE_URL =
	import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Feature flags
export const FEATURES = {
	ENABLE_METRICS_DASHBOARD: true,
	ENABLE_USER_MANAGEMENT: true,
	ENABLE_CONTENT_MANAGEMENT: true,
	ENABLE_SYSTEM_SETTINGS: true,
	ENABLE_ACTIVITY_MONITORING: true,
};

// Dashboard configuration
export const DASHBOARD_CONFIG = {
	refreshInterval: 60000, // refresh dashboard data every minute
	showRealTimeMetrics: true,
};

// Pagination defaults
export const PAGINATION = {
	defaultPageSize: 25,
	pageSizeOptions: [10, 25, 50, 100],
};

// Date format used throughout the admin UI
export const DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// Theme configuration
export const THEME = {
	primaryColor: '#0066cc',
	secondaryColor: '#ff9900',
	dangerColor: '#dc3545',
	successColor: '#28a745',
	warningColor: '#ffc107',
	infoColor: '#17a2b8',
};
