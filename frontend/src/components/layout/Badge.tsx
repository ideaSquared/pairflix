import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

export type BadgeVariant =
	| 'movie'
	| 'tv'
	| 'primary'
	| 'secondary'
	| 'success'
	| 'warning'
	| 'error';

interface BadgeProps {
	variant?: BadgeVariant;
	size?: 'small' | 'medium' | 'large';
	children: React.ReactNode;
}

const getVariantStyles = (variant: BadgeVariant = 'primary') => {
	const variants = {
		movie: css`
			background: ${theme.colors.status.wouldLikeToWatchTogether};
			color: ${theme.colors.text.primary};
		`,
		tv: css`
			background: ${theme.colors.status.toWatchTogether};
			color: ${theme.colors.text.primary};
		`,
		primary: css`
			background: ${theme.colors.primary};
			color: ${theme.colors.text.primary};
		`,
		secondary: css`
			background: ${theme.colors.secondary};
			color: ${theme.colors.text.primary};
		`,
		success: css`
			background: ${theme.colors.text.success};
			color: ${theme.colors.background.primary};
		`,
		warning: css`
			background: ${theme.colors.text.warning};
			color: ${theme.colors.background.primary};
		`,
		error: css`
			background: ${theme.colors.text.error};
			color: ${theme.colors.text.primary};
		`,
	};
	return variants[variant];
};

const getSizeStyles = (size: BadgeProps['size'] = 'medium') => {
	const sizes = {
		small: css`
			padding: ${theme.spacing.xs} ${theme.spacing.sm};
			font-size: ${theme.typography.fontSize.xs};
		`,
		medium: css`
			padding: ${theme.spacing.xs} ${theme.spacing.sm};
			font-size: ${theme.typography.fontSize.sm};
		`,
		large: css`
			padding: ${theme.spacing.sm} ${theme.spacing.md};
			font-size: ${theme.typography.fontSize.md};
		`,
	};
	return sizes[size];
};

const StyledBadge = styled.span<BadgeProps>`
	display: inline-block;
	border-radius: ${theme.borderRadius.sm};
	font-weight: ${theme.typography.fontWeight.medium};
	text-transform: uppercase;
	letter-spacing: 0.5px;
	${({ variant }) => getVariantStyles(variant)}
	${({ size }) => getSizeStyles(size)}
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
