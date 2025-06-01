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
	outlined?: boolean;
	pill?: boolean;
	dot?: boolean;
	count?: number;
	maxCount?: number;
}

const getVariantStyles = (
	variant: BadgeVariant = 'primary',
	outlined: boolean = false
) => {
	const variants = {
		primary: css`
			${({ theme }) =>
				outlined
					? `
					background: transparent;
					color: ${theme?.colors?.primary || '#0077cc'};
					border: 1px solid ${theme?.colors?.primary || '#0077cc'};
				`
					: `
					background: ${theme?.colors?.primary || '#0077cc'};
					color: ${theme?.colors?.text?.onPrimary || '#ffffff'};
				`}
		`,
		secondary: css`
			${({ theme }) =>
				outlined
					? `
					background: transparent;
					color: ${theme?.colors?.secondary || '#6c757d'};
					border: 1px solid ${theme?.colors?.secondary || '#6c757d'};
				`
					: `
					background: ${theme?.colors?.secondary || '#6c757d'};
					color: ${theme?.colors?.text?.onPrimary || '#ffffff'};
				`}
		`,
		success: css`
			${({ theme }) =>
				outlined
					? `
					background: transparent;
					color: ${theme?.colors?.text?.success || '#4caf50'};
					border: 1px solid ${theme?.colors?.text?.success || '#4caf50'};
				`
					: `
					background: ${theme?.colors?.text?.success || '#4caf50'};
					color: ${theme?.colors?.text?.onPrimary || '#ffffff'};
				`}
		`,
		error: css`
			${({ theme }) =>
				outlined
					? `
					background: transparent;
					color: ${theme?.colors?.text?.error || '#f44336'};
					border: 1px solid ${theme?.colors?.text?.error || '#f44336'};
				`
					: `
					background: ${theme?.colors?.text?.error || '#f44336'};
					color: ${theme?.colors?.text?.onPrimary || '#ffffff'};
				`}
		`,
		warning: css`
			${({ theme }) =>
				outlined
					? `
					background: transparent;
					color: ${theme?.colors?.text?.warning || '#ff9800'};
					border: 1px solid ${theme?.colors?.text?.warning || '#ff9800'};
				`
					: `
					background: ${theme?.colors?.text?.warning || '#ff9800'};
					color: ${theme?.colors?.text?.onPrimary || '#ffffff'};
				`}
		`,
		info: css`
			${({ theme }) =>
				outlined
					? `
					background: transparent;
					color: ${theme?.colors?.primary || '#0077cc'};
					border: 1px solid ${theme?.colors?.primary || '#0077cc'};
				`
					: `
					background: ${theme?.colors?.primary || '#0077cc'};
					color: ${theme?.colors?.text?.onPrimary || '#ffffff'};
				`}
		`,
		default: css`
			${({ theme }) =>
				outlined
					? `
					background: transparent;
					color: ${theme?.colors?.text?.secondary || '#666666'};
					border: 1px solid ${theme?.colors?.text?.secondary || '#666666'};
				`
					: `
					background: ${theme?.colors?.text?.secondary + '20' || '#66666620'};
					color: ${theme?.colors?.text?.secondary || '#666666'};
				`}
		`,
	};
	return variants[variant];
};

const getBadgeSize = (size: BadgeProps['size'] = 'medium') => {
	switch (size) {
		case 'small':
			return ({ theme }: { theme: Theme }) => theme?.spacing?.xs || '4px';
		case 'large':
			return ({ theme }: { theme: Theme }) => theme?.spacing?.md || '12px';
		default:
			return ({ theme }: { theme: Theme }) => theme?.spacing?.sm || '8px';
	}
};

interface StyledBadgeProps
	extends Omit<BadgeProps, 'className' | 'count' | 'maxCount'> {
	showAsDot?: boolean;
}

const StyledBadge = styled.span<StyledBadgeProps>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: ${({ size }) => getBadgeSize(size)};
	border-radius: ${({ theme, pill }) =>
		pill ? '999px' : theme?.borderRadius?.sm || '4px'};
	font-size: ${({ size, theme }) =>
		size === 'small'
			? theme?.typography?.fontSize?.xs || '10px'
			: size === 'large'
			? theme?.typography?.fontSize?.md || '16px'
			: theme?.typography?.fontSize?.sm || '14px'};
	font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
	line-height: 1.2;
	${({ variant, outlined }) => getVariantStyles(variant, outlined)}

	/* Handle dot style */
	${({ dot, showAsDot }) =>
		(dot || showAsDot) &&
		`
		width: 8px;
		height: 8px;
		padding: 0;
		border-radius: 50%;
	`}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme?.colors?.primary || '#0077cc'};
		outline-offset: 2px;
	}
`;

/**
 * Badge component for displaying status, counts, or labels
 */
export const Badge: React.FC<BadgeProps> = ({
	variant = 'primary',
	size = 'medium',
	children,
	className,
	outlined = false,
	pill = false,
	dot = false,
	count,
	maxCount = 99,
}) => {
	// Handle count display
	if (count !== undefined) {
		const displayValue = count > maxCount ? `${maxCount}+` : count.toString();
		return (
			<StyledBadge
				variant={variant}
				size={size === 'small' && count > 9 ? 'medium' : size}
				className={className}
				outlined={outlined}
				pill={true} // Always pill-shaped for counters
				showAsDot={count === 0}
			>
				{count === 0 ? null : displayValue}
			</StyledBadge>
		);
	}

	// Normal badge
	return (
		<StyledBadge
			variant={variant}
			size={size}
			className={className}
			outlined={outlined}
			pill={pill}
			dot={dot}
		>
			{children}
		</StyledBadge>
	);
};

/**
 * Status badge specifically for displaying status indicators
 */
export const StatusBadge: React.FC<
	Omit<BadgeProps, 'children'> & {
		status: 'active' | 'inactive' | 'pending' | 'blocked' | 'archived' | string;
	}
> = ({ status, ...props }) => {
	let variant: BadgeVariant = 'default';
	let label = status;

	switch (status.toLowerCase()) {
		case 'active':
			variant = 'success';
			label = 'Active';
			break;
		case 'inactive':
			variant = 'default';
			label = 'Inactive';
			break;
		case 'pending':
			variant = 'warning';
			label = 'Pending';
			break;
		case 'blocked':
			variant = 'error';
			label = 'Blocked';
			break;
		case 'archived':
			variant = 'secondary';
			label = 'Archived';
			break;
	}

	return (
		<Badge variant={variant} pill {...props}>
			{label}
		</Badge>
	);
};
