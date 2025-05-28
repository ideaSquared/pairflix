import styled, { css } from 'styled-components';

type TypographyVariant =
	| 'h1'
	| 'h2'
	| 'h3'
	| 'h4'
	| 'body1'
	| 'body2'
	| 'caption'
	| 'error'
	| 'success';

interface TypographyProps {
	variant?: TypographyVariant;
	align?: 'left' | 'center' | 'right';
	gutterBottom?: boolean;
	color?: string;
}

const getVariantStyles = (variant?: TypographyVariant) => {
	const variants = {
		h1: css`
			font-size: calc(${({ theme }) => theme.typography.fontSize.xl} * 1.5);
			font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
			line-height: 1.2;

			@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
				font-size: calc(${({ theme }) => theme.typography.fontSize.xl} * 1.3);
			}

			@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
				font-size: ${({ theme }) => theme.typography.fontSize.xl};
				line-height: 1.3;
			}
		`,
		h2: css`
			font-size: calc(${({ theme }) => theme.typography.fontSize.xl} * 1.2);
			font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
			line-height: 1.3;

			@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
				font-size: calc(${({ theme }) => theme.typography.fontSize.lg} * 1.2);
			}

			@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
				font-size: ${({ theme }) => theme.typography.fontSize.lg};
				line-height: 1.4;
			}
		`,
		h3: css`
			font-size: ${({ theme }) => theme.typography.fontSize.xl};
			font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
			line-height: 1.4;

			@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
				font-size: ${({ theme }) => theme.typography.fontSize.lg};
			}
		`,
		h4: css`
			font-size: calc(${({ theme }) => theme.typography.fontSize.md} * 1.1);
			font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
			line-height: 1.4;

			@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
				font-size: ${({ theme }) => theme.typography.fontSize.md};
			}
		`,
		body1: css`
			font-size: ${({ theme }) => theme.typography.fontSize.md};
			line-height: 1.5;

			@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
				line-height: 1.6; // Slightly increased line height for readability on mobile
			}
		`,
		body2: css`
			font-size: ${({ theme }) => theme.typography.fontSize.sm};
			line-height: 1.5;

			@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
				line-height: 1.6; // Slightly increased line height for readability on mobile
			}
		`,
		caption: css`
			font-size: ${({ theme }) => theme.typography.fontSize.xs};
			color: ${({ theme }) => theme.colors.text.secondary};
			line-height: 1.5;
		`,
		error: css`
			font-size: ${({ theme }) => theme.typography.fontSize.sm};
			color: ${({ theme }) => theme.colors.text.error};
			line-height: 1.5;
		`,
		success: css`
			font-size: ${({ theme }) => theme.typography.fontSize.sm};
			color: ${({ theme }) => theme.colors.text.success};
			line-height: 1.5;
		`,
	};
	return variants[variant || 'body1'];
};

export const Typography = styled.p<TypographyProps>`
	margin: 0;
	color: ${({ color, theme }) =>
		color || theme.colors?.text?.primary || '#1a1a1a'};
	text-align: ${({ align = 'left' }) => align};
	margin-bottom: ${({ gutterBottom, theme }) =>
		gutterBottom ? theme.spacing?.md || '1rem' : 0};
	${({ variant }) => getVariantStyles(variant)}

	/* Responsive margin-bottom for mobile */
	@media (max-width: ${({ theme }) => theme.breakpoints?.sm || '600px'}) {
		margin-bottom: ${({ gutterBottom, theme }) =>
			gutterBottom ? theme.spacing?.sm || '0.5rem' : 0};
	}

	a {
		color: ${({ theme }) => theme.colors?.primary || '#4853db'};
		text-decoration: none;
		font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || 500};
		&:hover {
			text-decoration: underline;
			color: ${({ theme }) => theme.colors?.primaryHover || '#3942b5'};
		}
		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.colors?.primary || '#4853db'};
			outline-offset: 2px;
		}
	}
`;

// Heading components for semantic HTML
export const H1 = styled(Typography).attrs({ as: 'h1', variant: 'h1' })``;
export const H2 = styled(Typography).attrs({ as: 'h2', variant: 'h2' })``;
export const H3 = styled(Typography).attrs({ as: 'h3', variant: 'h3' })``;
export const H4 = styled(Typography).attrs({ as: 'h4', variant: 'h4' })``;

// Specialized text components
export const ErrorText = styled(Typography).attrs({ variant: 'error' })``;
export const SuccessText = styled(Typography).attrs({ variant: 'success' })``;
export const Caption = styled(Typography).attrs({ variant: 'caption' })``;
