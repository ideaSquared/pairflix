import React from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles/theme';

export type BadgeColor =
	| 'primary'
	| 'secondary'
	| 'success'
	| 'error'
	| 'warning';

interface BadgeProps {
	color?: BadgeColor;
	size?: 'small' | 'medium' | 'large';
	children: React.ReactNode;
}

const getBadgeColor = (color: BadgeColor = 'primary') => {
	switch (color) {
		case 'primary':
			return '#646CFF'; // Enhanced primary color for better contrast
		case 'secondary':
			return '#595959'; // Darker for better contrast (4.5:1 ratio)
		case 'success':
			return '#2E7D32'; // Darker green for better contrast
		case 'error':
			return '#D32F2F'; // Accessible red
		case 'warning':
			return '#ED6C02'; // Accessible orange
		default:
			return '#646CFF';
	}
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
	background-color: ${({ color }) => getBadgeColor(color)};
	color: #ffffff;
	font-size: ${({ size, theme }) =>
		size === 'small'
			? theme.typography.fontSize.xs
			: size === 'large'
				? theme.typography.fontSize.md
				: theme.typography.fontSize.sm};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	line-height: 1.2; // Improved line height for better readability
`;

const Badge: React.FC<BadgeProps> = ({
	color = 'primary',
	size = 'medium',
	children,
}) => {
	return (
		<StyledBadge color={color} size={size}>
			{children}
		</StyledBadge>
	);
};

export default Badge;
