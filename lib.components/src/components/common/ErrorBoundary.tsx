import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { Flex } from './Layout';
import { H2, Typography } from './Typography';

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

const ErrorContainer = styled(Card).attrs({
	variant: 'secondary', // Change to secondary which is a valid variant for standard cards
})`
	max-width: 600px;
	margin: ${({ theme }) => theme?.spacing?.xl || '2rem'} auto;

	@media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
		margin: ${({ theme }) => theme?.spacing?.lg || '1.5rem'} auto;
	}
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
				<ErrorContainer>
					<CardContent>
						<H2>Something went wrong</H2>
						<ErrorMessage variant='body2'>
							{this.state.error?.message || 'An unexpected error occurred'}
						</ErrorMessage>
						<Flex gap='md' wrap='wrap'>
							<Button variant='primary' onClick={this.handleReset}>
								Try Again
							</Button>
							<Button variant='secondary' onClick={this.handleReload}>
								Reload Page
							</Button>
						</Flex>
					</CardContent>
				</ErrorContainer>
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
		<ErrorContainer>
			<CardContent>
				<H2>Something went wrong</H2>
				<ErrorMessage variant='body2'>
					{error?.message || 'An unexpected error occurred'}
				</ErrorMessage>
				<Flex gap='md'>
					{resetErrorBoundary && (
						<Button variant='primary' onClick={resetErrorBoundary}>
							Try Again
						</Button>
					)}
					<Button variant='secondary' onClick={() => window.location.reload()}>
						Reload Page
					</Button>
				</Flex>
			</CardContent>
		</ErrorContainer>
	);
};
