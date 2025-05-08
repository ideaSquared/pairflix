import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { Flex } from './Layout';
import { H2, Typography } from './Typography';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error?: Error;
}

const ErrorContainer = styled(Card)`
	max-width: 600px;
	margin: ${theme.spacing.xl} auto;
`;

const ErrorMessage = styled(Typography)`
	margin: ${theme.spacing.md} 0;
	padding: ${theme.spacing.md};
	background: ${theme.colors.background.primary};
	border-radius: ${theme.borderRadius.sm};
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
		this.props.onError?.(error, errorInfo);
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
				<ErrorContainer variant='primary'>
					<CardContent>
						<H2>Something went wrong</H2>
						<ErrorMessage variant='body2'>
							{this.state.error?.message || 'An unexpected error occurred'}
						</ErrorMessage>
						<Flex gap='md'>
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

// Modern functional component wrapper
export const ErrorBoundary: React.FC<Props> = ({ children, ...props }) => {
	return <ErrorBoundaryClass {...props}>{children}</ErrorBoundaryClass>;
};

// Custom hook for using error boundary in functional components
export const useErrorBoundary = () => {
	const throwError = (error: Error) => {
		throw error;
	};

	return { throwError };
};
