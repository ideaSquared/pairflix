import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GlobalStyles } from './styles/GlobalStyles';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
			cacheTime: 1000 * 60 * 30, // Cache is kept for 30 minutes
			refetchOnWindowFocus: false, // Disable automatic refetch on window focus
			retry: false, // Disable retries
		},
	},
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<GlobalStyles />
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</React.StrictMode>
);
