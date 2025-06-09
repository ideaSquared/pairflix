import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import mockTheme from '../../../__mocks__/mockTheme';
import { QueryErrorBoundary } from './QueryErrorBoundary';

// Mock component that throws an error
const ErrorComponent = () => {
  throw new Error('Test error');
};

// Mock component that doesn't throw
const WorkingComponent = () => <div>Working component</div>;

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>
    </QueryClientProvider>
  );
};

describe('QueryErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for cleaner test output
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    renderWithProviders(
      <QueryErrorBoundary>
        <WorkingComponent />
      </QueryErrorBoundary>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('renders error fallback when an error occurs', () => {
    renderWithProviders(
      <QueryErrorBoundary>
        <ErrorComponent />
      </QueryErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('There was an error with your data request')
    ).toBeInTheDocument();
    expect(
      screen.getByText('An error occurred while fetching data')
    ).toBeInTheDocument();
  });

  it('renders retry and reload buttons in error state', () => {
    renderWithProviders(
      <QueryErrorBoundary>
        <ErrorComponent />
      </QueryErrorBoundary>
    );

    expect(
      screen.getByRole('button', { name: 'Try Again' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reload Page' })
    ).toBeInTheDocument();
  });

  it('reload button is clickable', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <QueryErrorBoundary>
        <ErrorComponent />
      </QueryErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: 'Reload Page' });

    // Just verify the button is clickable and doesn't throw an error
    await expect(user.click(reloadButton)).resolves.not.toThrow();
  });

  it('logs error to console when error occurs', () => {
    const consoleSpy = jest.spyOn(console, 'error');

    renderWithProviders(
      <QueryErrorBoundary>
        <ErrorComponent />
      </QueryErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'React Query Error:',
      expect.any(Error)
    );
  });
});
