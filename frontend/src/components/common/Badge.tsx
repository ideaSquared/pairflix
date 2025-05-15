import React from 'react';
import styled, { css } from 'styled-components';
import { Theme } from '../../styles/theme';

export type BadgeVariant =
	| 'primary'
	| 'secondary'
	| 'success'
	| 'error'
	| 'warning'
	| 'info'
	| 'default';

interface BadgeProps {
	variant?: BadgeVariant;
	size?: 'small' | 'medium' | 'large';
	children: React.ReactNode;
	className?: string;
}

const getVariantStyles = (variant: BadgeVariant = 'primary') => {
	const variants = {
		primary: css`
			background: ${({ theme }) => theme.colors.primary};
			color: ${({ theme }) => theme.colors.text.primary};
		`,
		secondary: css`
			background: ${({ theme }) => theme.colors.secondary};
			color: ${({ theme }) => theme.colors.text.primary};
		`,
		success: css`
			background: ${({ theme }) => theme.colors.text.success};
			color: ${({ theme }) => theme.colors.text.primary};
		`,
		error: css`
			background: ${({ theme }) => theme.colors.text.error};
			color: ${({ theme }) => theme.colors.text.primary};
		`,
		warning: css`
			background: ${({ theme }) => theme.colors.text.warning};
			color: ${({ theme }) => theme.colors.text.primary};
		`,
		info: css`
			background: ${({ theme }) => theme.colors.primary};
			color: ${({ theme }) => theme.colors.text.primary};
		`,
		default: css`
			background: ${({ theme }) => `${theme.colors.text.secondary}20`};
			color: ${({ theme }) => theme.colors.text.secondary};
		`,
	};
	return variants[variant];
};

const getBadgeSize = (size: BadgeProps['size'] = 'medium') => {
	switch (size) {
		case 'small':
			return ({ theme }: { theme: Theme }) => theme.spacing.xs;
		case 'large':
			return ({ theme }: { theme: Theme }) => theme.spacing.md;
		default:
			return ({ theme }: { theme: Theme }) => theme.spacing.sm;
	}
};

const StyledBadge = styled.span<Omit<BadgeProps, 'className'>>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: ${({ size }) => getBadgeSize(size)};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	font-size: ${({ size, theme }) =>
		size === 'small'
			? theme.typography.fontSize.xs
			: size === 'large'
				? theme.typography.fontSize.md
				: theme.typography.fontSize.sm};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	line-height: 1.2; // Improved line height for better readability
	${({ variant }) => getVariantStyles(variant)}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.primary};
		outline-offset: 2px;
	}
`;

export const Badge: React.FC<BadgeProps> = ({
	variant = 'primary',
	size = 'medium',
	children,
	className,
}) => {
	return (
		<StyledBadge
			variant={variant}
			size={size}
			className={className || undefined}
		>
			{children}
		</StyledBadge>
	);
};

export default Badge;
