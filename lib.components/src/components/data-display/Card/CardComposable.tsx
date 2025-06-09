import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { BaseComponentProps } from '../../../types';

/**
 * Props for CardHeader component
 */
export interface CardHeaderProps extends BaseComponentProps {
  /**
   * Whether to use a divider between header and content
   * @default true
   */
  withDivider?: boolean;

  /**
   * Actions to render on the right side of the header
   */
  action?: React.ReactNode;
}

/**
 * Props for CardContent component
 */
export interface CardContentProps extends BaseComponentProps {
  /**
   * Whether to remove default padding
   * @default false
   */
  noPadding?: boolean;
}

/**
 * Props for CardFooter component
 */
export interface CardFooterProps extends BaseComponentProps {
  /**
   * Whether to use a divider between content and footer
   * @default true
   */
  withDivider?: boolean;
}

/**
 * Props for CardMedia component
 */
export interface CardMediaProps extends BaseComponentProps {
  /**
   * Image source URL
   */
  image?: string;

  /**
   * Aspect ratio of the media container (e.g., "16:9", "4:3", "1:1")
   * @default "16:9" (56.25%)
   */
  aspectRatio?: string;

  /**
   * Alternative text for the image
   */
  alt?: string;
}

/**
 * Props for CardGrid component
 */
export interface CardGridProps extends BaseComponentProps {
  /**
   * Minimum width of each card in the grid
   * @default "300px"
   */
  minCardWidth?: string;

  /**
   * Gap between cards
   */
  gap?: string;
}

// CardHeader component
const StyledCardHeader = styled.div<{ $withDivider?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme?.spacing?.md || '12px'};
  ${({ $withDivider, theme }) =>
    $withDivider &&
    `
    border-bottom: 1px solid ${theme?.colors?.border?.default || '#e0e0e0'};
  `}
  color: ${({ theme }) => theme?.colors?.text?.primary || '#000'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};

  /* Responsive padding for mobile */
  @media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
    padding: ${({ theme }) => theme?.spacing?.sm || '8px'};
  }
`;

export const CardHeader = forwardRef<
  HTMLDivElement,
  CardHeaderProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, withDivider = true, action, className, ...rest }, ref) => {
  return (
    <StyledCardHeader
      ref={ref}
      $withDivider={withDivider}
      className={className}
      {...rest}
    >
      <div>{children}</div>
      {action && <div className="card-header-action">{action}</div>}
    </StyledCardHeader>
  );
});

CardHeader.displayName = 'CardHeader';

// CardContent component
const StyledCardContent = styled.div<{ $noPadding?: boolean }>`
  padding: ${({ $noPadding, theme }) =>
    $noPadding ? '0' : theme?.spacing?.md || '12px'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#000'};

  /* Responsive padding for mobile */
  @media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
    padding: ${({ $noPadding, theme }) =>
      $noPadding ? '0' : theme?.spacing?.sm || '8px'};
  }
`;

export const CardContent = forwardRef<
  HTMLDivElement,
  CardContentProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, noPadding = false, className, ...rest }, ref) => {
  return (
    <StyledCardContent
      ref={ref}
      $noPadding={noPadding}
      className={className}
      {...rest}
    >
      {children}
    </StyledCardContent>
  );
});

CardContent.displayName = 'CardContent';

// CardFooter component
const StyledCardFooter = styled.div<{ $withDivider?: boolean }>`
  padding: ${({ theme }) => theme?.spacing?.md || '12px'};
  ${({ $withDivider, theme }) =>
    $withDivider &&
    `
    border-top: 1px solid ${theme?.colors?.border?.default || '#e0e0e0'};
  `}
  background: ${({ theme }) =>
    theme?.colors?.background?.secondary || '#f5f5f5'};

  /* Responsive padding for mobile */
  @media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
    padding: ${({ theme }) => theme?.spacing?.sm || '8px'};
  }
`;

export const CardFooter = forwardRef<
  HTMLDivElement,
  CardFooterProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, withDivider = true, className, ...rest }, ref) => {
  return (
    <StyledCardFooter
      ref={ref}
      $withDivider={withDivider}
      className={className}
      {...rest}
    >
      {children}
    </StyledCardFooter>
  );
});

CardFooter.displayName = 'CardFooter';

// CardMedia component
const StyledCardMedia = styled.div<{ $aspectRatio: string; $image?: string }>`
  position: relative;
  width: 100%;
  padding-top: ${({ $aspectRatio }) => {
    // Convert aspect ratio string to percentage
    if ($aspectRatio.includes(':')) {
      const parts = $aspectRatio.split(':');
      if (parts.length === 2) {
        const width = Number(parts[0]);
        const height = Number(parts[1]);
        if (!isNaN(width) && !isNaN(height) && width > 0) {
          return `${(height / width) * 100}%`;
        }
      }
    }
    // Fallback to default 16:9 if invalid format
    return '56.25%'; // 16:9 aspect ratio
  }};
  background-image: ${({ $image }) => ($image ? `url(${$image})` : 'none')};
  background-size: cover;
  background-position: center;
  overflow: hidden;
`;

const MediaImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const CardMedia = forwardRef<
  HTMLDivElement,
  CardMediaProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>
>(({ image, aspectRatio = '16:9', alt, children, className, ...rest }, ref) => {
  return (
    <StyledCardMedia
      ref={ref}
      $aspectRatio={aspectRatio}
      $image={!children ? image : undefined}
      className={className}
      {...rest}
    >
      {children ? (
        children
      ) : image ? (
        <MediaImage src={image} alt={alt || ''} />
      ) : null}
    </StyledCardMedia>
  );
});

CardMedia.displayName = 'CardMedia';

// CardGrid component
const StyledCardGrid = styled.div<{ $minCardWidth: string; $gap?: string }>`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(${props => props.$minCardWidth}, 1fr)
  );
  gap: ${({ $gap, theme }) => $gap || theme?.spacing?.md || '12px'};
  width: 100%;

  /* More refined responsive grid */
  @media (max-width: ${({ theme }) => theme?.breakpoints?.md || '768px'}) {
    grid-template-columns: repeat(
      auto-fill,
      minmax(
        ${props => Math.max(parseInt(props.$minCardWidth) * 0.85, 180)}px,
        1fr
      )
    );
    gap: ${({ $gap, theme }) => $gap || theme?.spacing?.sm || '8px'};
  }

  @media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
    grid-template-columns: 1fr;
    gap: ${({ $gap, theme }) => $gap || theme?.spacing?.sm || '8px'};
  }
`;

export const CardGrid = forwardRef<
  HTMLDivElement,
  CardGridProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, minCardWidth = '300px', gap, className, ...rest }, ref) => {
  return (
    <StyledCardGrid
      ref={ref}
      $minCardWidth={minCardWidth}
      $gap={gap}
      className={className}
      {...rest}
    >
      {children}
    </StyledCardGrid>
  );
});

CardGrid.displayName = 'CardGrid';
