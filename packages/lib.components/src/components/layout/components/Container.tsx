import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { breakpoints, type Theme } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';
import { container } from './Container.css';

export type ContainerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  /**
   * Maximum width constraint
   * @default 'lg'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'none';

  /**
   * Container padding
   * @default 'md'
   */
  padding?: keyof Theme['spacing'];

  /**
   * Whether container should be fluid width
   * @default false
   */
  fluid?: boolean;

  /**
   * Whether container should be centered
   * @default true
   */
  centered?: boolean;

  /**
   * Whether container should take full width of parent
   * @default false
   */
  isFullWidth?: boolean;

  /**
   * Container content
   */
  children: ReactNode;

  /**
   * Custom width override
   */
  width?: string;

  /**
   * Custom min-width
   */
  minWidth?: string;

  /**
   * Custom max-width override
   */
  customMaxWidth?: string;

  /**
   * Whether to disable padding on mobile
   * @default false
   */
  noPaddingOnMobile?: boolean;

  /**
   * Custom padding values for different breakpoints
   */
  responsivePadding?: {
    mobile?: keyof Theme['spacing'];
    tablet?: keyof Theme['spacing'];
    desktop?: keyof Theme['spacing'];
  };
};

export const Container = ({
  maxWidth = 'lg',
  padding = 'md',
  fluid = false,
  centered = true,
  isFullWidth = false,
  children,
  width,
  minWidth,
  customMaxWidth,
  noPaddingOnMobile = false,
  responsivePadding,
  className,
  style,
  ...rest
}: ContainerProps) => {
  const resolvedMaxWidth = customMaxWidth
    ? customMaxWidth
    : fluid || maxWidth === 'none'
      ? 'none'
      : breakpoints[maxWidth];

  const cssVars = {
    ...(width
      ? { '--container-width': width }
      : isFullWidth
        ? { '--container-width': '100%' }
        : {}),
    ...(responsivePadding?.desktop && {
      '--container-padding-desktop': vars.spacing[responsivePadding.desktop],
    }),
    ...(responsivePadding?.tablet && {
      '--container-padding-tablet': vars.spacing[responsivePadding.tablet],
    }),
    ...(noPaddingOnMobile
      ? { '--container-padding-mobile': '0' }
      : responsivePadding?.mobile
        ? {
            '--container-padding-mobile':
              vars.spacing[responsivePadding.mobile],
          }
        : {}),
  };

  return (
    <div
      className={clsx(container({ centered, padding }), className)}
      style={
        {
          ...cssVars,
          maxWidth: resolvedMaxWidth,
          ...(minWidth && { minWidth }),
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </div>
  );
};
