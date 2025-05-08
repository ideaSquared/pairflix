import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';
import { Flex } from './Layout';
import { Typography } from './Typography';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div<{ size?: number }>`
	width: ${({ size = 40 }) => size}px;
	height: ${({ size = 40 }) => size}px;
	border: 3px solid ${theme.colors.background.secondary};
	border-top: 3px solid ${theme.colors.primary};
	border-radius: 50%;
	animation: ${spin} 1s linear infinite;
`;

const LoadingContainer = styled(Flex)`
	align-items: center;
	justify-content: center;
	padding: ${theme.spacing.xl};
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
		<LoadingContainer
			direction='column'
			gap='md'
			style={fullScreen ? { minHeight: '100vh' } : undefined}
		>
			<LoadingSpinner size={size} />
			{message && <Typography>{message}</Typography>}
		</LoadingContainer>
	);

	return content;
};
