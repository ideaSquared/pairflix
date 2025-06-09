import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { BaseComponentProps } from '../../../types';

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
      border: 1px solid
        ${({ theme }) => theme?.colors?.border?.default || '#e0e0e0'};
    `,
    outlined: css`
      background: transparent;
      border: 1px solid
        ${({ theme }) => theme?.colors?.border?.default || '#e0e0e0'};
    `,
    stats: css`
      background: ${({ theme }) =>
        theme?.colors?.background?.secondary || '#f5f5f5'};
      border: 1px solid
        ${({ theme }) => theme?.colors?.border?.default || '#e0e0e0'};
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

interface CardContainerProps {
  $variant?: CardVariant;
  $accentColor?: string;
  $elevation?: ElevationType;
  $isInteractive?: boolean;
}

const CardContainer = styled.div<CardContainerProps>`
  padding: ${({ theme }) => theme?.spacing?.lg || '16px'};
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '4px'};
  ${({ $variant, $accentColor }) => getVariantStyles($variant, $accentColor)}
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme?.spacing?.md || '12px'};
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: ${({ $elevation = 'low' }) => getElevationStyles($elevation)};

  ${({ $isInteractive, theme }) =>
    $isInteractive &&
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

  /* Responsive adjustments for mobile */
  @media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
    padding: ${({ theme }) => theme?.spacing?.md || '12px'};
    margin-bottom: ${({ theme }) => theme?.spacing?.sm || '8px'};
  }
`;

const StatsCardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatsValue = styled.div`
  font-size: calc(
    ${({ theme }) => theme?.typography?.fontSize?.xl || '24px'} * 1.5
  );
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};

  /* Responsive font size for mobile */
  @media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
    font-size: ${({ theme }) => theme?.typography?.fontSize?.xl || '24px'};
  }
`;

const StatsCaption = styled.div`
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '12px'};
  margin-top: ${({ theme }) => theme?.spacing?.xs || '4px'};
  font-style: italic;
`;

const StatsTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme?.spacing?.sm || '8px'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.md || '16px'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666'};
`;

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
        $variant={variant}
        $accentColor={accentColor}
        $elevation={elevation}
        $isInteractive={isInteractive}
        className={className}
        {...rest}
      >
        <StatsCardContent>
          <StatsTitle>{title}</StatsTitle>
          <StatsValue style={valueColor ? { color: valueColor } : undefined}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </StatsValue>
          {caption && <StatsCaption>{caption}</StatsCaption>}
        </StatsCardContent>
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
      $variant={variant}
      $accentColor={accentColor}
      $elevation={elevation}
      $isInteractive={isInteractive}
      className={className}
      {...rest}
    >
      {children}
    </CardContainer>
  );
});

Card.displayName = 'Card';

export default Card;
