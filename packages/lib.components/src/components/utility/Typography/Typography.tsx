import clsx from 'clsx';
import React, { forwardRef, type JSX } from 'react';
import type { BaseComponentProps } from '../../../types';
import { typography } from './Typography.css';

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
  'light' | 'regular' | 'medium' | 'semibold' | 'bold';

export interface TypographyProps
  extends BaseComponentProps, React.HTMLAttributes<HTMLElement> {
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

const FONT_WEIGHT: Record<TypographyWeight, number> = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
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

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      variant = 'body1',
      as,
      align,
      gutterBottom,
      color,
      weight,
      truncate,
      lines = 1,
      noWrap,
      uppercase,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Use the appropriate HTML element based on variant if 'as' prop is not provided.
    // Rendered via createElement, not JSX -- a runtime-dynamic tag spread
    // with generic HTMLAttributes through JSX resolves every intrinsic
    // element's specific (and mutually incompatible) prop/ref type at once,
    // which TS can't check ("union too complex"); createElement's looser
    // typing for a variable element type sidesteps that.
    const Element = as || variantToElement[variant] || 'p';

    return React.createElement(Element, {
      ref,
      className: clsx(
        typography({
          variant,
          align,
          gutterBottom,
          truncate,
          noWrap,
          uppercase,
        }),
        className
      ),
      style: {
        ...(color ? { color } : undefined),
        ...(weight ? { fontWeight: FONT_WEIGHT[weight] } : undefined),
        ...(truncate ? { WebkitLineClamp: lines } : undefined),
        ...style,
      },
      ...props,
    });
  }
);

Typography.displayName = 'Typography';

// Heading components for semantic HTML
export const H1 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, 'variant' | 'as'> &
    React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => <Typography ref={ref} variant="h1" as="h1" {...props} />);
H1.displayName = 'H1';

export const H2 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="h2" as="h2" {...props} />);
H2.displayName = 'H2';

export const H3 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="h3" as="h3" {...props} />);
H3.displayName = 'H3';

export const H4 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="h4" as="h4" {...props} />);
H4.displayName = 'H4';

export const H5 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="h5" as="h5" {...props} />);
H5.displayName = 'H5';

export const H6 = forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="h6" as="h6" {...props} />);
H6.displayName = 'H6';

// Specialized text components
export const Text = forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="body1" {...props} />);
Text.displayName = 'Text';

export const SmallText = forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="body2" {...props} />);
SmallText.displayName = 'SmallText';

export const ErrorText = forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => (
  <Typography ref={ref} variant="error" as="span" {...props} />
));
ErrorText.displayName = 'ErrorText';

export const SuccessText = forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => (
  <Typography ref={ref} variant="success" as="span" {...props} />
));
SuccessText.displayName = 'SuccessText';

export const Caption = forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => (
  <Typography ref={ref} variant="caption" as="span" {...props} />
));
Caption.displayName = 'Caption';

export const Code = forwardRef<
  HTMLElement,
  Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => <Typography ref={ref} variant="code" as="code" {...props} />);
Code.displayName = 'Code';

export const Overline = forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, 'variant' | 'as'>
>((props, ref) => (
  <Typography ref={ref} variant="overline" as="span" {...props} />
));
Overline.displayName = 'Overline';

export default Typography;
