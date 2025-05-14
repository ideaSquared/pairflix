import React from 'react';
import styled from 'styled-components';

export type BadgeVariant = 'error' | 'warning' | 'info' | 'success' | 'default';

interface BadgeProps {
	variant: BadgeVariant;
	children: React.ReactNode;
}

const BadgeContainer = styled.span<{ variant: BadgeVariant }>`
	display: inline-flex;
	padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	font-size: ${({ theme }) => theme.typography.fontSize.xs};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	background: ${({ variant, theme }) => {
		switch (variant) {
			case 'error':
				return `${theme.colors.text.error}20`;
			case 'warning':
				return `${theme.colors.text.warning}20`;
			case 'info':
				return `${theme.colors.primary}20`;
			case 'success':
				return `${theme.colors.text.success}20`;
			default:
				return `${theme.colors.text.secondary}20`;
		}
	}};
	color: ${({ variant, theme }) => {
		switch (variant) {
			case 'error':
				return theme.colors.text.error;
			case 'warning':
				return theme.colors.text.warning;
			case 'info':
				return theme.colors.primary;
			case 'success':
				return theme.colors.text.success;
			default:
				return theme.colors.text.secondary;
		}
	}};
`;

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
	return <BadgeContainer variant={variant}>{children}</BadgeContainer>;
};
