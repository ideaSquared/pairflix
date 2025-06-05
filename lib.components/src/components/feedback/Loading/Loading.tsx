import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Typography } from '../../../components/utility/Typography/Typography';
import { BaseComponentProps } from '../../../types';
import { Flex } from '../../layout';

const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
`;

export interface SpinnerProps extends BaseComponentProps {
	/**
	 * Size of the spinner in pixels
	 * @default 40
	 */
	size?: number;

	/**
	 * Thickness of the spinner border in pixels
	 * @default 3
	 */
	thickness?: number;

	/**
	 * Custom color for the spinner
	 * If not provided, uses theme.colors.primary
	 */
	color?: string;

	/**
	 * Custom track color for the spinner
	 * If not provided, uses theme.colors.background.secondary
	 */
	trackColor?: string;

	/**
	 * Speed of the rotation animation in seconds
	 * @default 1
	 */
	speed?: number;
}

export const LoadingSpinner = styled.div<SpinnerProps>`
	width: ${({ size = 40 }) => size}px;
	height: ${({ size = 40 }) => size}px;
	border: ${({ thickness = 3 }) => thickness}px solid
		${({ theme, trackColor }) =>
			trackColor || theme.colors.background.secondary || '#f0f0f0'};
	border-top: ${({ thickness = 3 }) => thickness}px solid
		${({ theme, color }) => color || theme.colors.primary || '#0077cc'};
	border-radius: 50%;
	animation: ${spin} ${({ speed = 1 }) => speed}s linear infinite;
`;

const LoadingContainer = styled(Flex)`
	align-items: center;
	justify-content: center;
	padding: ${({ theme }) => theme.spacing.xl};
`;

const FullScreenContainer = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${({ theme }) => theme.colors.background.primary};
	z-index: 1000;
`;

const LoadingMessage = styled(Typography)`
	animation: ${pulse} 1.5s ease-in-out infinite;
`;

export interface LoadingProps extends BaseComponentProps {
	/**
	 * Size of the spinner in pixels
	 * @default 40
	 */
	size?: number;

	/**
	 * Loading message to display
	 * @default 'Loading...'
	 */
	message?: string;

	/**
	 * Whether to show in fullscreen mode
	 * @default false
	 */
	fullScreen?: boolean;

	/**
	 * Props to pass to the spinner component
	 */
	spinnerProps?: Omit<SpinnerProps, 'size'>;

	/**
	 * Additional content to render below the spinner
	 */
	children?: React.ReactNode;
}

/**
 * Loading component for displaying loading states with spinner and optional message
 */
export const Loading: React.FC<LoadingProps> = ({
	size = 40,
	message = 'Loading...',
	fullScreen = false,
	spinnerProps,
	children,
	className,
}) => {
	const content = (
		<LoadingContainer direction='column' gap='md' className={className}>
			<LoadingSpinner size={size} {...spinnerProps} />
			{message && (
				<LoadingMessage variant='body2' color='secondary'>
					{message}
				</LoadingMessage>
			)}
			{children}
		</LoadingContainer>
	);

	return fullScreen ? (
		<FullScreenContainer
			role='progressbar'
			aria-busy='true'
			aria-label={message}
		>
			{content}
		</FullScreenContainer>
	) : (
		<div role='progressbar' aria-busy='true' aria-label={message}>
			{content}
		</div>
	);
};

export interface InlineLoadingProps extends SpinnerProps {
	/**
	 * Message to display next to the spinner
	 * @default 'Loading...'
	 */
	message?: string;
}

/**
 * InlineLoading component for use within text or small spaces
 */
export const InlineLoading: React.FC<InlineLoadingProps> = ({
	size = 20,
	message = 'Loading...',
	...props
}) => (
	<Flex
		alignItems='center'
		gap='xs'
		role='progressbar'
		aria-busy='true'
		aria-label={message}
	>
		<LoadingSpinner size={size} {...props} />
		<Typography variant='caption'>{message}</Typography>
	</Flex>
);

/**
 * ButtonLoading component for use within buttons
 */
export const ButtonLoading: React.FC<SpinnerProps> = ({
	size = 16,
	...props
}) => <LoadingSpinner size={size} {...props} />;

export default Loading;
