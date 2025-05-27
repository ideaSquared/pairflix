import React from 'react';
import styled from 'styled-components';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
	variant: AlertVariant;
	children: React.ReactNode;
	onClose?: () => void;
}

const AlertContainer = styled.div<{ variant: AlertVariant }>`
	background: ${({ theme, variant }) => {
		switch (variant) {
			case 'success':
				return `${theme.colors.text.success}20`;
			case 'error':
				return `${theme.colors.text.error}20`;
			case 'warning':
				return `${theme.colors.text.warning}20`;
			case 'info':
			default:
				return `${theme.colors.primary}20`;
		}
	}};
	border: 1px solid
		${({ theme, variant }) => {
			switch (variant) {
				case 'success':
					return theme.colors.text.success;
				case 'error':
					return theme.colors.text.error;
				case 'warning':
					return theme.colors.text.warning;
				case 'info':
				default:
					return theme.colors.primary;
			}
		}};
	color: ${({ theme, variant }) => {
		switch (variant) {
			case 'success':
				return theme.colors.text.success;
			case 'error':
				return theme.colors.text.error;
			case 'warning':
				return theme.colors.text.warning;
			case 'info':
			default:
				return theme.colors.primary;
		}
	}};
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	margin-bottom: ${({ theme }) => theme.spacing.md};
	position: relative;
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	line-height: 1.5;
`;

const CloseButton = styled.button`
	position: absolute;
	top: 0;
	right: 0;
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	background: none;
	border: none;
	cursor: pointer;
	font-size: ${({ theme }) => theme.typography.fontSize.lg};
	color: inherit;
`;

export const Alert: React.FC<AlertProps> = ({ variant, children, onClose }) => {
	return (
		<AlertContainer variant={variant}>
			{children}
			{onClose && <CloseButton onClick={onClose}>×</CloseButton>}
		</AlertContainer>
	);
};
