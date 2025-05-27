import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../styles/ThemeProvider';

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

	const AllProviders = ({ children }: { children: React.ReactNode }) => (
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>{children}</ThemeProvider>
			</QueryClientProvider>
		</BrowserRouter>
	);

	return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
