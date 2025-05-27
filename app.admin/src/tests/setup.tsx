import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../styles/ThemeProvider';

// Set up environment variables that would normally be provided by Vite
process.env.VITE_API_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

// Mock window.matchMedia which is not available in Jest environment
window.matchMedia =
	window.matchMedia ||
	function () {
		return {
			matches: false,
			addListener: jest.fn(),
			removeListener: jest.fn(),
		};
	};

// Mock Vite's import.meta.env and export it for other modules
const viteEnv = {
	VITE_API_URL: process.env.VITE_API_URL,
	MODE: 'test',
	DEV: true,
	PROD: false,
	SSR: false,
	BASE_URL: '/',
	VITE_USER_NODE_ENV: 'test',
};

// Define import.meta globally for modules that use it directly
Object.defineProperty(global, 'import', {
	value: {
		meta: {
			env: viteEnv,
		},
	},
	writable: false,
});

// Export Vite mock for modules that import it explicitly
export const viteMock = { env: viteEnv };

// Create a fresh query client for each test
const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				cacheTime: 0,
			},
		},
		logger: {
			log: console.log,
			warn: console.warn,
			error: jest.fn(), // silence errors in tests
		},
	});

// Custom render function that includes all providers
function customRender(
	ui: ReactElement,
	options?: Omit<RenderOptions, 'wrapper'>
) {
	const queryClient = createTestQueryClient();

	function Wrapper({ children }: { children: React.ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>
					<BrowserRouter>{children}</BrowserRouter>
				</ThemeProvider>
			</QueryClientProvider>
		);
	}

	return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
