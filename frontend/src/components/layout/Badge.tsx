import React from 'react';
import styled from 'styled-components';

interface BadgeProps {
	variant?: 'movie' | 'tv' | 'primary' | 'secondary' | 'success' | 'warning';
	children: React.ReactNode;
}

const StyledBadge = styled.span<{ variant: BadgeProps['variant'] }>`
	display: inline-block;
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	font-size: 0.75rem;
	font-weight: 500;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	background: ${({ variant }) => {
		switch (variant) {
			case 'movie':
				return '#ff69b4';
			case 'tv':
				return '#9370db';
			case 'primary':
				return '#646cff';
			case 'secondary':
				return '#4a4a4a';
			case 'success':
				return '#00ff00';
			case 'warning':
				return '#ffd700';
			default:
				return '#646cff';
		}
	}};
	color: white;
`;

const Badge: React.FC<BadgeProps> = ({ variant = 'primary', children }) => {
	return <StyledBadge variant={variant}>{children}</StyledBadge>;
};

export default Badge;
