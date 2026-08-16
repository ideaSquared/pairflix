import clsx from 'clsx';
import React, { forwardRef } from 'react';
import type { BaseComponentProps } from '../../../types';
import {
  cardContainer,
  statsCardContent,
  statsCaption,
  statsTitle,
  statsValue,
} from './Card.css';

export type CardVariant = 'primary' | 'secondary' | 'outlined' | 'stats';
export type ElevationType = 'low' | 'medium' | 'high';

/**
 * Base props for all card variants
 */
export interface CardBaseProps extends BaseComponentProps {
  /**
   * The visual style of the card
   * @default 'primary'
   */
  variant?: CardVariant;

  /**
   * Accent color for the card (optional)
   */
  accentColor?: string;

  /**
   * Elevation level of the card (controls shadow)
   * @default 'low'
   */
  elevation?: ElevationType;

  /**
   * Whether the card has interactive hover states
   * @default false
   */
  isInteractive?: boolean;
}

/**
 * Props specific to standard cards
 */
export interface StandardCardProps extends CardBaseProps {
  variant?: 'primary' | 'secondary' | 'outlined';
  children: React.ReactNode;
  title?: never;
  value?: never;
  valueColor?: never;
  caption?: never;
}

/**
 * Props specific to stats cards
 */
export interface StatsCardProps extends CardBaseProps {
  variant: 'stats';
  title: string;
  value: string | number;
  valueColor?: string;
  caption?: string;
  children?: never;
}

/**
 * Union type for all card variations
 */
export type CardProps = StandardCardProps | StatsCardProps;

interface CardContainerProps {
  variant?: CardVariant;
  accentColor?: string;
  elevation?: ElevationType;
  isInteractive?: boolean;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
}

// `accentColor` is an arbitrary caller-supplied color and only means
// anything for the `primary` variant (the only one with a border accent) --
// applied via inline style since it can't be baked into a static class.
const CardContainer = forwardRef<
  HTMLDivElement,
  CardContainerProps &
    Omit<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>
>(
  (
    {
      variant,
      accentColor,
      elevation,
      isInteractive,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const isPrimary = (variant ?? 'primary') === 'primary';
    return (
      <div
        ref={ref}
        className={clsx(
          cardContainer({ variant, elevation, isInteractive }),
          className
        )}
        style={
          isPrimary && accentColor
            ? { borderLeft: `4px solid ${accentColor}`, ...style }
            : style
        }
        {...rest}
      />
    );
  }
);
CardContainer.displayName = 'CardContainer';

/**
 * Card component for displaying content in a contained, styled container
 */
export const Card = forwardRef<
  HTMLDivElement,
  CardProps & React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  // Determine if this is a stats card
  if (props.variant === 'stats') {
    const {
      title,
      value,
      valueColor,
      caption,
      variant,
      accentColor,
      className,
      elevation,
      isInteractive,
      ...rest
    } = props as StatsCardProps;

    return (
      <CardContainer
        ref={ref}
        variant={variant}
        accentColor={accentColor}
        elevation={elevation}
        isInteractive={isInteractive}
        className={className}
        {...rest}
      >
        <div className={statsCardContent}>
          <h3 className={statsTitle}>{title}</h3>
          <div
            className={statsValue}
            style={valueColor ? { color: valueColor } : undefined}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {caption && <div className={statsCaption}>{caption}</div>}
        </div>
      </CardContainer>
    );
  }

  // It's a standard card
  const {
    children,
    variant,
    accentColor,
    className,
    elevation,
    isInteractive,
    ...rest
  } = props as StandardCardProps;

  return (
    <CardContainer
      ref={ref}
      variant={variant}
      accentColor={accentColor}
      elevation={elevation}
      isInteractive={isInteractive}
      className={className}
      {...rest}
    >
      {children}
    </CardContainer>
  );
});

Card.displayName = 'Card';

export default Card;
