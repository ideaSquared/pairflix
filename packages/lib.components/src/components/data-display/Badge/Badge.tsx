import clsx from 'clsx';
import React, { forwardRef } from 'react';
import type { BaseComponentProps } from '../../../types';
import { badge } from './Badge.css';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default'
  | 'custom';

export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps
  extends
    BaseComponentProps,
    Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * The variant of the badge
   * @default 'default'
   */
  variant?: BadgeVariant;

  /**
   * The size of the badge
   * @default 'medium'
   */
  size?: BadgeSize;

  /**
   * The content of the badge
   */
  children?: React.ReactNode;

  /**
   * Whether to use an outlined style
   * @default false
   */
  outlined?: boolean;

  /**
   * Whether to use a pill shape (fully rounded corners)
   * @default false
   */
  pill?: boolean;

  /**
   * Whether to display as a dot without content
   * @default false
   */
  dot?: boolean;

  /**
   * Numeric value to display in the badge
   */
  count?: number;

  /**
   * Maximum count to display before showing a '+' suffix
   * @default 99
   */
  maxCount?: number;

  /**
   * Custom background color (only when variant='custom')
   */
  backgroundColor?: string;

  /**
   * Custom text color (only when variant='custom')
   */
  textColor?: string;

  /**
   * Whether the badge should be absolute positioned
   * @default false
   */
  absolute?: boolean;

  /**
   * Position when using absolute positioning
   * @default 'top-right'
   */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

  /**
   * Offset values when using absolute positioning
   */
  offset?: {
    x?: number | string;
    y?: number | string;
  };

  /**
   * Whether to animate when the count changes
   * @default false
   */
  animate?: boolean;
}

/**
 * The recipe only knows the seven theme-driven variants. `custom` is
 * resolved to `default` here and painted via inline style instead, since
 * arbitrary caller-supplied colors can't be baked into a static class.
 */
const resolveRecipeVariant = (
  variant: BadgeVariant
): Exclude<BadgeVariant, 'custom'> =>
  variant === 'custom' ? 'default' : variant;

const getCustomStyle = (
  variant: BadgeVariant,
  outlined: boolean,
  backgroundColor?: string,
  textColor?: string
): React.CSSProperties | undefined => {
  if (variant !== 'custom' || (!backgroundColor && !textColor)) {
    return undefined;
  }
  return {
    background: outlined ? 'transparent' : backgroundColor,
    color: outlined ? backgroundColor : textColor || '#ffffff',
    border: outlined ? `1px solid ${backgroundColor}` : 'none',
  };
};

const getOffsetStyle = (
  offset?: BadgeProps['offset']
): React.CSSProperties | undefined =>
  offset ? { marginTop: offset.y ?? 0, marginLeft: offset.x ?? 0 } : undefined;

/**
 * Badge component for displaying status indicators, counts, or labels
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'medium',
      children,
      className,
      style,
      outlined = false,
      pill = false,
      dot = false,
      count,
      maxCount = 99,
      backgroundColor,
      textColor,
      absolute = false,
      position = 'top-right',
      offset,
      animate = false,
      ...props
    },
    ref
  ) => {
    const badgeClassName = (showAsDot: boolean) =>
      clsx(
        badge({
          variant: resolveRecipeVariant(variant),
          size: size === 'small' && (count ?? 0) > 9 ? 'medium' : size,
          pill,
          outlined,
          dot: dot || showAsDot,
          absolute,
          position,
          animate,
        }),
        className
      );

    const badgeStyle = {
      ...getCustomStyle(variant, outlined, backgroundColor, textColor),
      ...getOffsetStyle(offset),
      ...style,
    };

    // Handle count display
    if (count !== undefined) {
      const displayValue = count > maxCount ? `${maxCount}+` : count.toString();
      const ariaLabel = `Count: ${count}`;

      return (
        <span
          ref={ref}
          className={badgeClassName(count === 0)}
          style={badgeStyle}
          role="status"
          aria-label={ariaLabel}
          {...props}
        >
          {count === 0 ? null : displayValue}
        </span>
      );
    }

    // Normal badge
    return (
      <span
        ref={ref}
        className={badgeClassName(false)}
        style={badgeStyle}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * Status badge specifically for displaying status indicators
 */
export const StatusBadge = forwardRef<
  HTMLSpanElement,
  Omit<BadgeProps, 'children'> & {
    status: 'active' | 'inactive' | 'pending' | 'blocked' | 'archived' | string;
  }
>(({ status, ...props }, ref) => {
  let variant: BadgeVariant = 'default';
  let label = status;

  switch (status.toLowerCase()) {
    case 'active':
      variant = 'success';
      label = 'Active';
      break;
    case 'inactive':
      variant = 'default';
      label = 'Inactive';
      break;
    case 'pending':
      variant = 'warning';
      label = 'Pending';
      break;
    case 'blocked':
      variant = 'error';
      label = 'Blocked';
      break;
    case 'archived':
      variant = 'secondary';
      label = 'Archived';
      break;
  }

  return (
    <Badge ref={ref} variant={variant} pill {...props}>
      {label}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default Badge;
