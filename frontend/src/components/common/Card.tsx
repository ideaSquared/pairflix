import React from 'react';
import styled, { css } from 'styled-components';
import { Theme } from '../../styles/theme';

export type CardVariant = 'primary' | 'secondary' | 'outlined';

interface CardProps {
	variant?: CardVariant;
	accentColor?: string;
	children: React.ReactNode;
	className?: string;
	elevation?: 'low' | 'medium' | 'high';
	interactive?: boolean;
}

const getVariantStyles = (
	variant: CardVariant = 'primary',
	accentColor?: string
) => {
	const variants = {
		primary: css`
			background: ${({ theme }) => theme.colors.background.secondary};
			border-left: 4px solid
				${({ theme }) => accentColor || theme.colors.primary};
		`,
		secondary: css`
			background: ${({ theme }) => theme.colors.background.secondary};
			border: 1px solid ${({ theme }) => theme.colors.border};
		`,
		outlined: css`
			background: transparent;
			border: 1px solid ${({ theme }) => theme.colors.border};
		`,
	};
	return variants[variant];
};

const getElevationStyles = (elevation: CardProps['elevation'] = 'low') => {
	const elevations = {
		low: '0 2px 4px rgba(0, 0, 0, 0.1)',
		medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
		high: '0 8px 16px rgba(0, 0, 0, 0.2)',
	};
	return elevations[elevation];
};

const CardContainer = styled.div<Omit<CardProps, 'children'>>`
	padding: ${({ theme }) => theme.spacing.lg};
	border-radius: ${({ theme }) => theme.borderRadius.md};
	${({ variant, accentColor }) => getVariantStyles(variant, accentColor)}
	overflow: hidden;
	margin-bottom: ${({ theme }) => theme.spacing.md};
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease;
	box-shadow: ${({ elevation }) => getElevationStyles(elevation)};

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
			outline: 2px solid ${theme.colors.primary};
			outline-offset: 2px;
		}
	`}
`;

export const Card: React.FC<CardProps> = ({
	variant = 'primary',
	accentColor,
	children,
	className,
	elevation,
	interactive,
}) => {
	return (
		<CardContainer
			variant={variant}
			accentColor={accentColor}
			className={className}
			elevation={elevation}
			interactive={interactive}
		>
			{children}
		</CardContainer>
	);
};

export const CardTitle = styled.h3`
	margin: 0 0 ${({ theme }) => theme.spacing.md};
	font-size: ${({ theme }) => theme.typography.fontSize.lg};
	font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
	color: ${({ theme }) => theme.colors.text.primary};
`;

export const CardContent = styled.div<{ noPadding?: boolean }>`
	padding: ${({ noPadding, theme }) => (noPadding ? '0' : theme.spacing.md)};
	color: ${({ theme }) => theme.colors.text.primary};
`;

export const CardHeader = styled.div`
	padding: ${({ theme }) => theme.spacing.md};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
	color: ${({ theme }) => theme.colors.text.primary};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

export const CardFooter = styled.div`
	padding: ${({ theme }) => theme.spacing.md};
	border-top: 1px solid ${({ theme }) => theme.colors.border};
	background: ${({ theme }) => theme.colors.background.secondary};
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
	gap: ${({ theme }) => theme.spacing.md};
	padding: ${({ theme }) => theme.spacing.md} 0;

	@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
		grid-template-columns: 1fr;
	}
`;
