import React from 'react';
import styled, { css } from 'styled-components';
import { Theme } from '../../styles/theme';

export type BadgeVariant =
	| 'primary'
	| 'secondary'
	| 'success'
	| 'error'
	| 'warning';

interface BadgeProps {
	variant?: BadgeVariant;
	size?: 'small' | 'medium' | 'large';
	children: React.ReactNode;
}

const getVariantStyles = (variant: BadgeVariant = 'primary') => {
	const variants = {
		primary: css`
			background: ${({ theme }) => theme.colors.primary};
			color: #ffffff;
		`,
		secondary: css`
			background: ${({ theme }) => theme.colors.secondary};
			color: ${({ theme }) => theme.colors.text.primary};
		`,
		success: css`
			background: ${({ theme }) => theme.colors.text.success};
			color: ${({ theme }) =>
				theme.colors.background.primary === '#ffffff' ? '#ffffff' : '#000000'};
		`,
		error: css`
			background: ${({ theme }) => theme.colors.text.error};
			color: #ffffff;
		`,
		warning: css`
			background: ${({ theme }) => theme.colors.text.warning};
			color: #000000;
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

const StyledBadge = styled.span<BadgeProps>`
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

const Badge: React.FC<BadgeProps> = ({
	variant = 'primary',
	size = 'medium',
	children,
}) => {
	return (
		<StyledBadge variant={variant} size={size}>
			{children}
		</StyledBadge>
	);
};

export default Badge;
