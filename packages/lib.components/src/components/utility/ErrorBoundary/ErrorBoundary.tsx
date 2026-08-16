import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card, CardContent } from '../../../components/data-display/Card';
import { Button } from '../../../components/inputs/Button';
import { H2, Typography } from '../../../components/utility/Typography';
import { errorContainer, errorMessage, flexRow } from './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnMount?: boolean; // Reset error state when the component mounts
}

interface State {
  hasError: boolean;
  error?: Error | undefined;
}

// Class component required by React for error boundaries
class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public componentDidMount() {
    // Reset error state when the component mounts if specified
    if (this.props.resetOnMount && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <Card variant="secondary" className={errorContainer}>
          <CardContent>
            <H2>Something went wrong</H2>
            <Typography variant="body2" className={errorMessage}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            <div className={flexRow({ wrap: true })}>
              <Button variant="primary" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button variant="secondary" onClick={this.handleReload}>
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorBoundary component to catch and display errors in the React component tree.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   onError={(error) => console.error(error)}
 *   fallback={<CustomErrorComponent />}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export const ErrorBoundary: React.FC<Props> = ({ children, ...props }) => {
  return <ErrorBoundaryClass {...props}>{children}</ErrorBoundaryClass>;
};

/**
 * Custom hook for manually triggering errors within functional components.
 *
 * @example
 * ```tsx
 * const { throwError } = useErrorBoundary();
 *
 * const handleRiskyOperation = () => {
 *   try {
 *     // Risky operation
 *   } catch (error) {
 *     throwError(error instanceof Error ? error : new Error(String(error)));
 *   }
 * };
 * ```
 */
export const useErrorBoundary = () => {
  const throwError = (error: Error) => {
    throw error;
  };

  return { throwError };
};

/**
 * A simple component to display an error message with retry options.
 */
export const ErrorFallback: React.FC<{
  error?: Error | null;
  resetErrorBoundary?: () => void;
}> = ({ error, resetErrorBoundary }) => {
  return (
    <Card variant="secondary" className={errorContainer}>
      <CardContent>
        <H2>Something went wrong</H2>
        <Typography variant="body2" className={errorMessage}>
          {error?.message || 'An unexpected error occurred'}
        </Typography>
        <div className={flexRow({ wrap: false })}>
          {resetErrorBoundary && (
            <Button variant="primary" onClick={resetErrorBoundary}>
              Try Again
            </Button>
          )}
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorBoundary;
