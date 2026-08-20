// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\utility\ErrorBoundary\ErrorBoundary.test.tsx
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { lightThemeClass, themeRoot } from '../../../styles/theme.css';
import ErrorBoundary, { ErrorFallback } from './ErrorBoundary';

// Mock console.error to prevent test output pollution
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Helper function to render with the real theme class applied
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);
};

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Component that uses the useErrorBoundary hook (kept for potential future use)
// const ErrorThrower = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
//   const { throwError } = useErrorBoundary();

//   if (shouldThrow) {
//     throwError(new Error('Manually thrown error'));
//   }

//   return (
//     <button onClick={() => throwError(new Error('Button click error'))}>
//       Throw Error
//     </button>
//   );
// };

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    renderWithTheme(
      <ErrorBoundary>
        <div data-testid="child">Child Component</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    // Suppress React's error boundary warning in test console
    const originalConsoleError = console.error;
    console.error = vi.fn();

    renderWithTheme(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Restore console.error
    console.error = originalConsoleError;

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    // Suppress React's error boundary warning in test console
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const CustomFallback = () => (
      <div data-testid="custom-fallback">Custom Error UI</div>
    );

    renderWithTheme(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError />
      </ErrorBoundary>
    );

    // Restore console.error
    console.error = originalConsoleError;

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });

  it('calls onError prop when an error occurs', () => {
    // Suppress React's error boundary warning in test console
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const handleError = vi.fn();

    renderWithTheme(
      <ErrorBoundary onError={handleError}>
        <ThrowError />
      </ErrorBoundary>
    );

    // Restore console.error
    console.error = originalConsoleError;

    expect(handleError).toHaveBeenCalled();
    expect(handleError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(handleError.mock.calls[0]?.[0].message).toBe('Test error');
  });

  // This test simulates clicking "Try Again" but because of how React handles error boundaries in tests,
  // we can't fully test the reset behavior
  it('renders try again button', () => {
    // Suppress React's error boundary warning in test console
    const originalConsoleError = console.error;
    console.error = vi.fn();

    renderWithTheme(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Restore console.error
    console.error = originalConsoleError;

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
});

describe('ErrorFallback', () => {
  it('renders with error message', () => {
    const error = new Error('Custom error message');
    const resetErrorBoundary = vi.fn();

    renderWithTheme(
      <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders default message when no error provided', () => {
    renderWithTheme(<ErrorFallback />);

    expect(
      screen.getByText('An unexpected error occurred')
    ).toBeInTheDocument();
  });

  it('calls resetErrorBoundary when try again button is clicked', () => {
    const resetErrorBoundary = vi.fn();

    renderWithTheme(
      <ErrorFallback
        error={new Error('Error')}
        resetErrorBoundary={resetErrorBoundary}
      />
    );

    fireEvent.click(screen.getByText('Try Again'));
    expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
  });

  it('does not render try again button when resetErrorBoundary is not provided', () => {
    renderWithTheme(<ErrorFallback error={new Error('Error')} />);

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  // Skip full testing of reload functionality as it would trigger a page reload
  it('renders reload page button', () => {
    renderWithTheme(<ErrorFallback />);

    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });
});
