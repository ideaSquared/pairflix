import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import React from 'react';
import styled from 'styled-components';
import {
  Button,
  Card,
  CardContent,
  ErrorBoundary,
  Flex,
  H2,
  Typography,
} from '../../../';

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
}

const ErrorContainer = styled(Card)`
  max-width: 600px;
  margin: ${({ theme }) => theme?.spacing?.xl || '2rem'} auto;
`;

const ErrorMessage = styled(Typography)`
  margin: ${({ theme }) => theme?.spacing?.md || '1rem'} 0;
  padding: ${({ theme }) => theme?.spacing?.md || '1rem'};
  background: ${({ theme }) => theme?.colors?.background?.primary || '#f5f5f5'};
  border-radius: ${({ theme }) => theme?.borderRadius?.sm || '4px'};
  font-family: monospace;
  white-space: pre-wrap;
  overflow-x: auto;
`;

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
    <ErrorContainer variant="primary">
      <CardContent>
        <H2>Something went wrong</H2>
        <Typography>There was an error with your data request</Typography>
        <ErrorMessage variant="body2">
          An error occurred while fetching data
        </ErrorMessage>
        <Flex gap="md">
          <Button variant="primary" onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Flex>
      </CardContent>
    </ErrorContainer>
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
