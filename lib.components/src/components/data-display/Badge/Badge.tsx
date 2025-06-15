import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { BaseComponentProps } from '../../../types';

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
  extends BaseComponentProps,
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

const getVariantStyles = (
  variant: BadgeVariant = 'default',
  outlined: boolean = false,
  backgroundColor?: string,
  textColor?: string
) => {
  if (variant === 'custom' && (backgroundColor || textColor)) {
    return css`
      background: ${outlined ? 'transparent' : backgroundColor};
      color: ${outlined ? backgroundColor : textColor || '#ffffff'};
      border: ${outlined ? `1px solid ${backgroundColor}` : 'none'};
    `;
  }

  const variants = {
    primary: css`
      ${({ theme }) =>
        outlined
          ? `
					background: transparent;
					color: ${theme?.colors?.primary || '#0077cc'};
					border: 1px solid ${theme?.colors?.primary || '#0077cc'};
				`
          : `
					background: ${theme?.colors?.primary || '#0077cc'};
					color: ${theme?.colors?.text?.onPrimary || '#ffffff'};
				`}
    `,
    secondary: css`
      ${({ theme }) =>
        outlined
          ? `
					background: transparent;
					color: ${theme?.colors?.secondary || '#6c757d'};
					border: 1px solid ${theme?.colors?.secondary || '#6c757d'};
				`
          : `
					background: ${theme?.colors?.secondary || '#6c757d'};
					color: ${theme?.colors?.text?.onPrimary || '#ffffff'};
				`}
    `,
    success: css`
      ${({ theme }) =>
        outlined
          ? `
					background: transparent;
					color: ${theme?.colors?.text?.success || '#4caf50'};
					border: 1px solid ${theme?.colors?.text?.success || '#4caf50'};
				`
          : `
					background: ${theme?.colors?.text?.success || '#4caf50'};
					color: ${theme?.colors?.text?.onPrimary || '#ffffff'};
				`}
    `,
    error: css`
      ${({ theme }) =>
        outlined
          ? `
					background: transparent;
					color: ${theme?.colors?.text?.error || '#f44336'};
					border: 1px solid ${theme?.colors?.text?.error || '#f44336'};
				`
          : `
					background: ${theme?.colors?.text?.error || '#f44336'};
					color: ${theme?.colors?.text?.onPrimary || '#ffffff'};
				`}
    `,
    warning: css`
      ${({ theme }) =>
        outlined
          ? `
					background: transparent;
					color: ${theme?.colors?.text?.warning || '#ff9800'};
					border: 1px solid ${theme?.colors?.text?.warning || '#ff9800'};
				`
          : `
					background: ${theme?.colors?.text?.warning || '#ff9800'};
					color: ${theme?.colors?.text?.onPrimary || '#ffffff'};
				`}
    `,
    info: css`
      ${({ theme }) =>
        outlined
          ? `
					background: transparent;
					color: ${theme?.colors?.info || '#03a9f4'};
					border: 1px solid ${theme?.colors?.info || '#03a9f4'};
				`
          : `
					background: ${theme?.colors?.info || '#03a9f4'};
					color: ${theme?.colors?.text?.onPrimary || '#ffffff'};
				`}
    `,
    default: css`
      ${({ theme }) =>
        outlined
          ? `
					background: transparent;
					color: ${theme?.colors?.text?.secondary || '#666666'};
					border: 1px solid ${theme?.colors?.text?.secondary || '#666666'};
				`
          : `
					background: ${theme?.colors?.text?.secondary + '20' || '#66666620'};
					color: ${theme?.colors?.text?.secondary || '#666666'};
				`}
    `,
  } as const;

  // Handle the custom variant that was caught early, fallback to default
  if (variant === 'custom') {
    return variants.default;
  }

  return variants[variant as keyof typeof variants] || variants.default;
};

const getBadgeSize = (size: BadgeSize = 'medium') => {
  const sizes = {
    small: css`
      padding: ${({ theme }) => theme?.spacing?.xs || '4px'};
      font-size: ${({ theme }) => theme?.typography?.fontSize?.xs || '10px'};
    `,
    medium: css`
      padding: ${({ theme }) => theme?.spacing?.sm || '8px'};
      font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '14px'};
    `,
    large: css`
      padding: ${({ theme }) => theme?.spacing?.md || '12px'};
      font-size: ${({ theme }) => theme?.typography?.fontSize?.md || '16px'};
    `,
  };
  return sizes[size];
};

const getPositionStyles = (position: BadgeProps['position'] = 'top-right') => {
  const positions = {
    'top-right': css`
      top: 0;
      right: 0;
      transform: translate(50%, -50%);
    `,
    'top-left': css`
      top: 0;
      left: 0;
      transform: translate(-50%, -50%);
    `,
    'bottom-right': css`
      bottom: 0;
      right: 0;
      transform: translate(50%, 50%);
    `,
    'bottom-left': css`
      bottom: 0;
      left: 0;
      transform: translate(-50%, 50%);
    `,
  };
  return positions[position];
};

const slideIn = css`
  @keyframes slideIn {
    from {
      transform: scale(0.5);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

interface StyledBadgeProps
  extends Omit<BadgeProps, 'className' | 'count' | 'maxCount'> {
  showAsDot?: boolean;
}

const StyledBadge = styled.span<StyledBadgeProps>`
  ${slideIn}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${({ size }) => getBadgeSize(size)};
  border-radius: ${({ theme, pill }) =>
    pill ? '999px' : theme?.borderRadius?.sm || '4px'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  line-height: 1.2;
  transition: all 0.2s ease;
  min-width: ${({ size }) =>
    size === 'small' ? '16px' : size === 'large' ? '28px' : '20px'};

  ${({ variant, outlined, backgroundColor, textColor }) =>
    getVariantStyles(variant, outlined, backgroundColor, textColor)}

  ${({ pill, size }) =>
    pill &&
    css`
      padding-left: ${size === 'small'
        ? '8px'
        : size === 'large'
          ? '16px'
          : '12px'};
      padding-right: ${size === 'small'
        ? '8px'
        : size === 'large'
          ? '16px'
          : '12px'};
    `}

  ${({ dot, showAsDot }) =>
    (dot || showAsDot) &&
    css`
      width: 8px;
      height: 8px;
      padding: 0;
      border-radius: 50%;
      min-width: unset;
    `}

	${({ absolute, position }) =>
    absolute &&
    css`
      position: absolute;
      ${getPositionStyles(position)}
    `}

	${({ offset }) =>
    offset &&
    css`
      margin-top: ${offset.y || 0};
      margin-left: ${offset.x || 0};
    `}

	${({ animate }) =>
    animate &&
    css`
      animation: slideIn 0.2s ease-out;
    `}

	&:focus-visible {
    outline: 2px solid ${({ theme }) => theme?.colors?.primary || '#0077cc'};
    outline-offset: 2px;
  }
`;

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
    // Handle count display
    if (count !== undefined) {
      const displayValue = count > maxCount ? `${maxCount}+` : count.toString();
      const ariaLabel = `Count: ${count}`;

      return (
        <StyledBadge
          ref={ref}
          variant={variant}
          size={size === 'small' && count > 9 ? 'medium' : size}
          className={className}
          outlined={outlined}
          pill={true} // Always pill-shaped for counters
          showAsDot={count === 0}
          backgroundColor={backgroundColor}
          textColor={textColor}
          absolute={absolute}
          position={position}
          offset={offset}
          animate={animate}
          role="status"
          aria-label={ariaLabel}
          {...props}
        >
          {count === 0 ? null : displayValue}
        </StyledBadge>
      );
    }

    // Normal badge
    return (
      <StyledBadge
        ref={ref}
        variant={variant}
        size={size}
        className={className}
        outlined={outlined}
        pill={pill}
        dot={dot}
        backgroundColor={backgroundColor}
        textColor={textColor}
        absolute={absolute}
        position={position}
        offset={offset}
        animate={animate}
        {...props}
      >
        {children}
      </StyledBadge>
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
