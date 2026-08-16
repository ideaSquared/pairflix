import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import React from 'react';
import {
  Button,
  Card,
  CardContent,
  ErrorBoundary,
  Flex,
  H2,
  Typography,
} from '../../../';
import { errorContainer, errorMessage } from './QueryErrorBoundary.css';

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * An error boundary specifically for React Query errors
 * Provides reset functionality to retry failed queries
 */
export const QueryErrorBoundary: React.FC<QueryErrorBoundaryProps> = ({
  children,
}) => {
  const { reset } = useQueryErrorResetBoundary();

  // Create a custom fallback component with the reset functionality
  const fallback = (
    <Card variant="primary" className={errorContainer}>
      <CardContent>
        <H2>Something went wrong</H2>
        <Typography>There was an error with your data request</Typography>
        <Typography variant="body2" className={errorMessage}>
          An error occurred while fetching data
        </Typography>
        <Flex gap="md">
          <Button variant="primary" onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Flex>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={error => {
        console.error('React Query Error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default QueryErrorBoundary;
