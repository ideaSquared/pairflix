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
		`,
		h2: css`
			font-size: calc(${({ theme }) => theme.typography.fontSize.xl} * 1.2);
			font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
			line-height: 1.3;
		`,
		h3: css`
			font-size: ${({ theme }) => theme.typography.fontSize.xl};
			font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
			line-height: 1.4;
		`,
		h4: css`
			font-size: calc(${({ theme }) => theme.typography.fontSize.md} * 1.1);
			font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
			line-height: 1.4;
		`,
		body1: css`
			font-size: ${({ theme }) => theme.typography.fontSize.md};
			line-height: 1.5;
		`,
		body2: css`
			font-size: ${({ theme }) => theme.typography.fontSize.sm};
			line-height: 1.5;
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
	color: ${({ color, theme }) => color || theme.colors.text.primary};
	text-align: ${({ align = 'left' }) => align};
	margin-bottom: ${({ gutterBottom, theme }) =>
		gutterBottom ? theme.spacing.md : 0};
	${({ variant }) => getVariantStyles(variant)}

	a {
		color: ${({ theme }) => theme.colors.primary};
		text-decoration: none;
		font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
		&:hover {
			text-decoration: underline;
			color: ${({ theme }) => theme.colors.primaryHover};
		}
		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.colors.primary};
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
