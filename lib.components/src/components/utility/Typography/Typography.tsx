import { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { BaseComponentProps } from '../../../types';

export type TypographyVariant =
	| 'h1'
	| 'h2'
	| 'h3'
	| 'h4'
	| 'h5'
	| 'h6'
	| 'body1'
	| 'body2'
	| 'caption'
	| 'error'
	| 'success'
	| 'overline'
	| 'code';

export type TypographyWeight =
	| 'light'
	| 'regular'
	| 'medium'
	| 'semibold'
	| 'bold';

export interface TypographyProps extends BaseComponentProps {
	/**
	 * The variant of the typography
	 * @default 'body1'
	 */
	variant?: TypographyVariant;

	/**
	 * Text alignment
	 * @default 'left'
	 */
	align?: 'left' | 'center' | 'right' | 'justify';

	/**
	 * Whether to add bottom margin
	 * @default false
	 */
	gutterBottom?: boolean;

	/**
	 * Custom text color. Can use theme colors like 'primary' or 'error'
	 */
	color?: string;

	/**
	 * Custom font weight. Overrides the variant's default weight
	 */
	weight?: TypographyWeight;

	/**
	 * Whether to truncate text with ellipsis
	 * @default false
	 */
	truncate?: boolean;

	/**
	 * Number of lines to show before truncating
	 * Only works when truncate is true
	 * @default 1
	 */
	lines?: number;

	/**
	 * Whether to preserve whitespace
	 * @default false
	 */
	noWrap?: boolean;

	/**
	 * Whether to make the text all uppercase
	 * @default false
	 */
	uppercase?: boolean;

	/**
	 * Component to render as
	 * @default based on variant or 'p'
	 */
	as?: keyof JSX.IntrinsicElements;
}

const getVariantStyles = (variant?: TypographyVariant) => {
	const variants = {
		h1: css`
			font-size: calc(${({ theme }) => theme.typography.fontSize.xl} * 1.5);
			font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
			line-height: 1.2;
			letter-spacing: -0.02em;

			@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
				font-size: calc(${({ theme }) => theme.typography.fontSize.lg} * 1.5);
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
			letter-spacing: -0.01em;

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
		`,
		h5: css`
			font-size: ${({ theme }) => theme.typography.fontSize.md};
			font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
			line-height: 1.4;
		`,
		h6: css`
			font-size: ${({ theme }) => theme.typography.fontSize.sm};
			font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
			line-height: 1.4;
		`,
		body1: css`
			font-size: ${({ theme }) => theme.typography.fontSize.md};
			line-height: 1.5;

			@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
				line-height: 1.6;
			}
		`,
		body2: css`
			font-size: ${({ theme }) => theme.typography.fontSize.sm};
			line-height: 1.5;

			@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
				line-height: 1.6;
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
		overline: css`
			font-size: ${({ theme }) => theme.typography.fontSize.xs};
			text-transform: uppercase;
			letter-spacing: 0.1em;
			line-height: 1.5;
		`,
		code: css`
			font-family: ${({ theme }) => theme.typography.fontFamily.mono};
			font-size: ${({ theme }) => theme.typography.fontSize.sm};
			padding: ${({ theme }) => theme.spacing.xs};
			background: ${({ theme }) => theme.colors.background.secondary};
			border-radius: ${({ theme }) => theme.borderRadius.sm};
			line-height: 1.5;
		`,
	};
	return variants[variant || 'body1'];
};

const getFontWeight = (weight?: TypographyWeight) => {
	const weights = {
		light: 300,
		regular: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
	};
	return weight ? weights[weight] : undefined;
};

const variantToElement: Record<TypographyVariant, keyof JSX.IntrinsicElements> =
	{
		h1: 'h1',
		h2: 'h2',
		h3: 'h3',
		h4: 'h4',
		h5: 'h5',
		h6: 'h6',
		body1: 'p',
		body2: 'p',
		caption: 'span',
		error: 'span',
		success: 'span',
		overline: 'span',
		code: 'code',
	};

const StyledTypography = styled.p<TypographyProps>`
	margin: 0;
	color: ${({ color, theme }) =>
		color || theme.colors?.text?.primary || '#1a1a1a'};
	text-align: ${({ align = 'left' }) => align};
	margin-bottom: ${({ gutterBottom, theme }) =>
		gutterBottom ? theme.spacing?.md || '1rem' : 0};
	font-weight: ${({ weight }) => (weight ? getFontWeight(weight) : 'inherit')};
	${({ variant }) => getVariantStyles(variant)}

	${({ truncate, lines = 1 }) =>
		truncate &&
		css`
			display: -webkit-box;
			-webkit-line-clamp: ${lines};
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;
		`}

	${({ noWrap }) =>
		noWrap &&
		css`
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		`}

	${({ uppercase }) =>
		uppercase &&
		css`
			text-transform: uppercase;
		`}

	/* Responsive margin-bottom for mobile */
	@media (max-width: ${({ theme }) => theme.breakpoints?.sm || '600px'}) {
		margin-bottom: ${({ gutterBottom, theme }) =>
			gutterBottom ? theme.spacing?.sm || '0.5rem' : 0};
	}

	a {
		color: ${({ theme }) => theme.colors?.primary || '#4853db'};
		text-decoration: none;
		font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || 500};
		transition: color 0.2s ease, text-decoration 0.2s ease;

		&:hover {
			text-decoration: underline;
			color: ${({ theme }) => theme.colors?.primaryHover || '#3942b5'};
		}

		&:focus-visible {
			outline: 2px solid ${({ theme }) => theme.colors?.primary || '#4853db'};
			outline-offset: 2px;
			border-radius: 2px;
		}
	}
`;

export const Typography = forwardRef<HTMLElement, TypographyProps>(
	({ variant = 'body1', as, ...props }, ref) => {
		// Use the appropriate HTML element based on variant if 'as' prop is not provided
		const element = as || variantToElement[variant] || 'p';

		return (
			<StyledTypography ref={ref} as={element} variant={variant} {...props} />
		);
	}
);

Typography.displayName = 'Typography';

// Heading components for semantic HTML
export const H1 = forwardRef<
	HTMLHeadingElement,
	Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant='h1' as='h1' {...props} />);
H1.displayName = 'H1';

export const H2 = forwardRef<
	HTMLHeadingElement,
	Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant='h2' as='h2' {...props} />);
H2.displayName = 'H2';

export const H3 = forwardRef<
	HTMLHeadingElement,
	Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant='h3' as='h3' {...props} />);
H3.displayName = 'H3';

export const H4 = forwardRef<
	HTMLHeadingElement,
	Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant='h4' as='h4' {...props} />);
H4.displayName = 'H4';

export const H5 = forwardRef<
	HTMLHeadingElement,
	Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant='h5' as='h5' {...props} />);
H5.displayName = 'H5';

export const H6 = forwardRef<
	HTMLHeadingElement,
	Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant='h6' as='h6' {...props} />);
H6.displayName = 'H6';

// Specialized text components
export const Text = forwardRef<
	HTMLParagraphElement,
	Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant='body1' {...props} />);
Text.displayName = 'Text';

export const SmallText = forwardRef<
	HTMLParagraphElement,
	Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant='body2' {...props} />);
SmallText.displayName = 'SmallText';

export const ErrorText = forwardRef<
	HTMLSpanElement,
	Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => (
	<Typography ref={ref} variant='error' as='span' {...props} />
));
ErrorText.displayName = 'ErrorText';

export const SuccessText = forwardRef<
	HTMLSpanElement,
	Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => (
	<Typography ref={ref} variant='success' as='span' {...props} />
));
SuccessText.displayName = 'SuccessText';

export const Caption = forwardRef<
	HTMLSpanElement,
	Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => (
	<Typography ref={ref} variant='caption' as='span' {...props} />
));
Caption.displayName = 'Caption';

export const Code = forwardRef<
	HTMLElement,
	Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant='code' as='code' {...props} />);
Code.displayName = 'Code';

export const Overline = forwardRef<
	HTMLSpanElement,
	Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => (
	<Typography ref={ref} variant='overline' as='span' {...props} />
));
Overline.displayName = 'Overline';

export default Typography;
