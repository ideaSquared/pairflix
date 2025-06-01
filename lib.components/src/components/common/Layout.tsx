import { ReactNode } from 'react';
import styled from 'styled-components';
import type { Theme } from '../../styles/theme';

export interface GridProps {
	columns?: number | string;
	gap?: keyof Theme['spacing'];
	alignItems?: 'start' | 'center' | 'end' | 'stretch';
	justifyContent?:
		| 'start'
		| 'center'
		| 'end'
		| 'space-between'
		| 'space-around'
		| 'flex-start'
		| 'flex-end';
	mobileColumns?: number | string; // Mobile-specific columns
	tabletColumns?: number | string; // Tablet-specific columns
	desktopColumns?: number | string; // Desktop-specific columns
}

export const Grid = styled.div<GridProps>`
	display: grid;
	grid-template-columns: ${({ columns = 1 }) =>
		typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns};
	gap: ${({ gap = 'md', theme }) => theme.spacing[gap]};
	align-items: ${({ alignItems = 'stretch' }) => alignItems};
	justify-content: ${({ justifyContent = 'start' }) => justifyContent};

	@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
		grid-template-columns: ${({ tabletColumns }) =>
			tabletColumns
				? typeof tabletColumns === 'number'
					? `repeat(${tabletColumns}, 1fr)`
					: tabletColumns
				: 'repeat(2, 1fr)'};
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
		grid-template-columns: ${({ mobileColumns }) =>
			mobileColumns
				? typeof mobileColumns === 'number'
					? `repeat(${mobileColumns}, 1fr)`
					: mobileColumns
				: '1fr'};
	}
`;

export interface ContainerProps {
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
	padding?: keyof Theme['spacing'];
	fluid?: boolean; // Whether container should be fluid width
	centered?: boolean; // Whether container should be centered
	fullWidth?: boolean; // Whether container should take full width of parent
	children: ReactNode;
}

export const Container = styled.div<ContainerProps>`
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	margin-left: ${({ centered }) => (centered ? 'auto' : '0')};
	margin-right: ${({ centered }) => (centered ? 'auto' : '0')};
	padding-left: ${({ padding = 'md', theme }) => theme.spacing[padding]};
	padding-right: ${({ padding = 'md', theme }) => theme.spacing[padding]};
	max-width: ${({ maxWidth = 'lg', fluid, theme }) =>
		fluid || maxWidth === 'none' ? 'none' : theme.breakpoints[maxWidth]};
`;

export interface FlexProps {
	direction?: 'row' | 'column';
	gap?: keyof Theme['spacing'];
	alignItems?: 'start' | 'center' | 'end' | 'stretch';
	justifyContent?:
		| 'start'
		| 'center'
		| 'end'
		| 'space-between'
		| 'space-around'
		| 'flex-start'
		| 'flex-end';
	wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

export const Flex = styled.div<FlexProps>`
	display: flex;
	flex-direction: ${({ direction = 'row' }) => direction};
	gap: ${({ gap = 'md', theme }) => theme.spacing[gap]};
	align-items: ${({ alignItems = 'stretch' }) => alignItems};
	justify-content: ${({ justifyContent = 'start' }) => justifyContent};
	flex-wrap: ${({ wrap = 'nowrap' }) => wrap};
`;

export const Spacer = styled.div<{
	size: keyof Theme['spacing'];
	inline?: boolean;
}>`
	height: ${({ size, theme, inline }) =>
		inline ? 'auto' : theme.spacing[size]};
	width: ${({ size, theme }) => theme.spacing[size]};
`;

export const Divider = styled.hr<{
	vertical?: boolean;
	spacing?: keyof Theme['spacing'];
}>`
	border: none;
	border-top: ${({ vertical }) => (vertical ? 'none' : '1px solid')};
	border-left: ${({ vertical }) => (vertical ? '1px solid' : 'none')};
	border-color: ${({ theme }) => theme.colors.border.light};
	margin: ${({ spacing = 'md', theme }) =>
		`${theme.spacing[spacing]} 0 ${theme.spacing[spacing]} 0`};
	height: ${({ vertical }) => (vertical ? '100%' : 0)};
	align-self: stretch;
`;

// Define responsive breakpoints
export const breakpoints = {
	xs: '375px', // Small mobile
	sm: '576px', // Mobile
	md: '768px', // Tablet
	lg: '992px', // Small desktop
	xl: '1200px', // Desktop
	xxl: '1600px', // Large desktop
};

// Media query helpers for better readability
export const media = {
	mobile: `(max-width: ${breakpoints.sm})`,
	tablet: `(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`,
	desktop: `(min-width: ${breakpoints.lg})`,
	smallMobile: `(max-width: ${breakpoints.xs})`,
	smallDesktop: `(min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl})`,
	largeDesktop: `(min-width: ${breakpoints.xl})`,
};

export const Section = styled.section<{
	spacing?: keyof Theme['spacing'];
	fullWidth?: boolean;
}>`
	padding-top: ${({ spacing = 'xl', theme }) => theme.spacing[spacing]};
	padding-bottom: ${({ spacing = 'xl', theme }) => theme.spacing[spacing]};
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

	@media ${media.mobile} {
		padding-top: ${({ spacing = 'xl', theme }) =>
			spacing === 'xl' ? theme.spacing.lg : theme.spacing.md};
		padding-bottom: ${({ spacing = 'xl', theme }) =>
			spacing === 'xl' ? theme.spacing.lg : theme.spacing.md};
	}
`;
