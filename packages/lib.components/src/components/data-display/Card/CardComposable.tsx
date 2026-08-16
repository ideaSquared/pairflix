import clsx from 'clsx';
import React, { forwardRef } from 'react';
import type { BaseComponentProps } from '../../../types';
import {
  cardContent,
  cardFooter,
  cardGrid,
  cardGridVars,
  cardHeader,
  cardMedia,
  mediaImage,
} from './CardComposable.css';

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
export const CardHeader = forwardRef<
  HTMLDivElement,
  CardHeaderProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, withDivider = true, action, className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(cardHeader({ withDivider }), className)}
      {...rest}
    >
      <div>{children}</div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

// CardContent component
export const CardContent = forwardRef<
  HTMLDivElement,
  CardContentProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, noPadding = false, className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(cardContent({ noPadding }), className)}
      {...rest}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

// CardFooter component
export const CardFooter = forwardRef<
  HTMLDivElement,
  CardFooterProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, withDivider = true, className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(cardFooter({ withDivider }), className)}
      {...rest}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

// Converts an aspect ratio string like "16:9" into a padding-top percentage.
// Falls back to the 16:9 default (56.25%) for any invalid format.
const aspectRatioToPadding = (aspectRatio: string): string => {
  const parts = aspectRatio.split(':');
  if (parts.length === 2) {
    const width = Number(parts[0]);
    const height = Number(parts[1]);
    if (!isNaN(width) && !isNaN(height) && width > 0) {
      return `${(height / width) * 100}%`;
    }
  }
  return '56.25%';
};

export const CardMedia = forwardRef<
  HTMLDivElement,
  CardMediaProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>
>(
  (
    { image, aspectRatio = '16:9', alt, children, className, style, ...rest },
    ref
  ) => {
    const backgroundImage = !children && image ? `url(${image})` : undefined;
    return (
      <div
        ref={ref}
        className={clsx(cardMedia, className)}
        style={{
          paddingTop: aspectRatioToPadding(aspectRatio),
          backgroundImage,
          ...style,
        }}
        {...rest}
      >
        {children ? (
          children
        ) : image ? (
          <img className={mediaImage} src={image} alt={alt || ''} />
        ) : null}
      </div>
    );
  }
);

CardMedia.displayName = 'CardMedia';

// CardGrid component
export const CardGrid = forwardRef<
  HTMLDivElement,
  CardGridProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    { children, minCardWidth = '300px', gap, className, style, ...rest },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(cardGrid, className)}
        style={
          {
            [cardGridVars.minCardWidth]: minCardWidth,
            ...(gap ? { [cardGridVars.gap]: gap } : {}),
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {children}
      </div>
    );
  }
);

CardGrid.displayName = 'CardGrid';
