import React from 'react';
import styled, { css } from 'styled-components';
import { Theme } from '../../styles/theme';
import { H3, Typography } from './Typography';

export type CardVariant = 'primary' | 'secondary' | 'outlined' | 'stats';
export type ElevationType = 'low' | 'medium' | 'high';

// Create separate interfaces for different card variants
interface BaseCardProps {
	variant?: CardVariant;
	accentColor?: string;
	className?: string;
	elevation?: ElevationType;
	interactive?: boolean;
}

// For regular cards that require children
interface StandardCardProps extends BaseCardProps {
	variant?: 'primary' | 'secondary' | 'outlined';
	children: React.ReactNode;
	title?: never;
	value?: never;
	valueColor?: never;
}

// For stats cards that don't require children but need title and value
interface StatsCardProps extends BaseCardProps {
	variant: 'stats';
	title: string;
	value: string | number;
	valueColor?: string;
	children?: never; // Stats cards don't use children
}

// Union type for all card variations
export type CardProps = StandardCardProps | StatsCardProps;

const getVariantStyles = (
	variant: CardVariant = 'primary',
	accentColor?: string
) => {
	const variants = {
		primary: css`
			background: ${({ theme }) =>
				theme?.colors?.background?.secondary || '#f5f5f5'};
			border-left: 4px solid
				${({ theme }) => accentColor || theme?.colors?.primary || '#3366ff'};
		`,
		secondary: css`
			background: ${({ theme }) =>
				theme?.colors?.background?.secondary || '#f5f5f5'};
			border: 1px solid ${({ theme }) => theme?.colors?.border || '#e0e0e0'};
		`,
		outlined: css`
			background: transparent;
			border: 1px solid ${({ theme }) => theme?.colors?.border || '#e0e0e0'};
		`,
		stats: css`
			background: ${({ theme }) =>
				theme?.colors?.background?.secondary || '#f5f5f5'};
			border: 1px solid ${({ theme }) => theme?.colors?.border || '#e0e0e0'};
		`,
	};
	return variants[variant];
};

const getElevationStyles = (elevation: ElevationType = 'low') => {
	const elevations = {
		low: '0 2px 4px rgba(0, 0, 0, 0.1)',
		medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
		high: '0 8px 16px rgba(0, 0, 0, 0.2)',
	};
	return elevations[elevation];
};

// Explicitly define the props for CardContainer
interface CardContainerProps {
	variant?: CardVariant;
	accentColor?: string;
	className?: string;
	elevation?: ElevationType;
	interactive?: boolean;
	theme?: Theme;
}

const CardContainer = styled.div.attrs<CardContainerProps>((props) => ({
	className: props.className || '',
}))<CardContainerProps>`
	padding: ${({ theme }) => theme?.spacing?.lg || '16px'};
	border-radius: ${({ theme }) => theme?.borderRadius?.md || '4px'};
	${({ variant, accentColor }) => getVariantStyles(variant, accentColor)}
	overflow: hidden;
	margin-bottom: ${({ theme }) => theme?.spacing?.md || '12px'};
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease;
	box-shadow: ${({ elevation = 'low' }) => getElevationStyles(elevation)};

	${({ interactive, theme }: { interactive?: boolean; theme: Theme }) =>
		interactive &&
		`
    cursor: pointer;
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${getElevationStyles('medium')};
    }
    &:active {
      transform: translateY(0);
    }
    &:focus-visible {
      outline: 2px solid ${theme?.colors?.primary || '#0077cc'};
      outline-offset: 2px;
    }
  `}
`;

const StatsCardContent = styled.div`
	display: flex;
	flex-direction: column;
`;

const StatsValue = styled(Typography)`
	font-size: calc(
		${({ theme }) => theme?.typography?.fontSize?.xl || '24px'} * 1.5
	);
	font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
`;

export const Card = (props: CardProps) => {
	// Helper function to filter out undefined values
	const filterProps = (obj: Record<string, any>) => {
		return Object.fromEntries(
			Object.entries(obj).filter(([_, value]) => value !== undefined)
		);
	};

	// Determine if this is a stats card
	if (props.variant === 'stats') {
		const {
			title,
			value,
			valueColor,
			variant,
			accentColor,
			className,
			elevation,
			interactive,
		} = props;

		const containerProps = filterProps({
			variant,
			accentColor,
			className,
			elevation,
			interactive,
		});

		return (
			<CardContainer {...containerProps}>
				<StatsCardContent>
					<H3>{title}</H3>
					<StatsValue style={valueColor ? { color: valueColor } : undefined}>
						{typeof value === 'number' ? value.toLocaleString() : value}
					</StatsValue>
				</StatsCardContent>
			</CardContainer>
		);
	}

	// It's a standard card
	const { children, variant, accentColor, className, elevation, interactive } =
		props;

	const containerProps = filterProps({
		variant,
		accentColor,
		className,
		elevation,
		interactive,
	});

	return <CardContainer {...containerProps}>{children}</CardContainer>;
};

export const CardTitle = styled.h3`
	margin: 0 0 ${({ theme }) => theme?.spacing?.md || '12px'};
	font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '18px'};
	font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
	color: ${({ theme }) => theme?.colors?.text?.primary || '#000'};
`;

export const CardContent = styled.div<{ noPadding?: boolean }>`
	padding: ${({ noPadding, theme }) =>
		noPadding ? '0' : theme?.spacing?.md || '12px'};
	color: ${({ theme }) => theme?.colors?.text?.primary || '#000'};
`;

export const CardHeader = styled.div`
	padding: ${({ theme }) => theme?.spacing?.md || '12px'};
	border-bottom: 1px solid ${({ theme }) => theme?.colors?.border || '#e0e0e0'};
	color: ${({ theme }) => theme?.colors?.text?.primary || '#000'};
	font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
`;

export const CardFooter = styled.div`
	padding: ${({ theme }) => theme?.spacing?.md || '12px'};
	border-top: 1px solid ${({ theme }) => theme?.colors?.border || '#e0e0e0'};
	background: ${({ theme }) =>
		theme?.colors?.background?.secondary || '#f5f5f5'};
`;

export const CardMedia = styled.div<{ aspectRatio?: string }>`
	position: relative;
	width: 100%;
	padding-top: ${({ aspectRatio = '56.25%' }) =>
		aspectRatio}; /* 16:9 by default */
	background-size: cover;
	background-position: center;
`;

export const CardGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: ${({ theme }) => theme?.spacing?.md || '12px'};
	padding: ${({ theme }) => theme?.spacing?.md || '12px'} 0;

	@media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
		grid-template-columns: 1fr;
	}
`;
