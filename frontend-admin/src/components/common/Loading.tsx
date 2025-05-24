import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Flex } from './Layout';
import { Typography } from './Typography';

const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div<{ size?: number }>`
	width: ${({ size = 40 }) => size}px;
	height: ${({ size = 40 }) => size}px;
	border: 3px solid ${({ theme }) => theme.colors.background.secondary};
	border-top: 3px solid ${({ theme }) => theme.colors.primary};
	border-radius: 50%;
	animation: ${spin} 1s linear infinite;
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
				<Typography variant='body2' color='secondary'>
					{message}
				</Typography>
			)}
		</LoadingContainer>
	);

	return fullScreen ? (
		<FullScreenContainer>{content}</FullScreenContainer>
	) : (
		content
	);
};
