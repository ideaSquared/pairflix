import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Flex } from './Layout';
import { Typography } from './Typography';

const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
`;

export const LoadingSpinner = styled.div<{ size?: number }>`
	width: ${({ size = 40 }) => size}px;
	height: ${({ size = 40 }) => size}px;
	border: 3px solid
		${({ theme }) => theme.colors.background.secondary || '#f0f0f0'};
	border-top: 3px solid ${({ theme }) => theme.colors.primary || '#0077cc'};
	border-radius: 50%;
	animation: ${spin} 1s linear infinite;
`;

const LoadingContainer = styled(Flex)`
	align-items: center;
	justify-content: center;
	padding: ${({ theme }) => theme.spacing.xl || '2rem'};
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
	background: ${({ theme }) => theme.colors.background.primary || '#ffffff'};
	z-index: 1000;
`;

const LoadingMessage = styled(Typography)`
	animation: ${pulse} 1.5s ease-in-out infinite;
`;

interface LoadingProps {
	size?: number;
	message?: string;
	fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
	size = 40,
	message = 'Loading...',
	fullScreen = false,
}) => {
	const content = (
		<LoadingContainer direction='column' gap='md'>
			<LoadingSpinner size={size} />
			{message && (
				<LoadingMessage variant='body2' color='secondary'>
					{message}
				</LoadingMessage>
			)}
		</LoadingContainer>
	);

	return fullScreen ? (
		<FullScreenContainer aria-live='polite' aria-busy='true'>
			{content}
		</FullScreenContainer>
	) : (
		<div aria-live='polite' aria-busy='true'>
			{content}
		</div>
	);
};

// Additional loading variants
export const InlineLoading: React.FC<{ size?: number }> = ({ size = 20 }) => (
	<Flex alignItems='center' gap='xs'>
		<LoadingSpinner size={size} />
		<Typography variant='caption'>Loading...</Typography>
	</Flex>
);

export const ButtonLoading: React.FC<{ size?: number }> = ({ size = 16 }) => (
	<LoadingSpinner size={size} />
);
