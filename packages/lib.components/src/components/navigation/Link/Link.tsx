import clsx from 'clsx';
import React, { forwardRef } from 'react';
import type { BaseComponentProps } from '../../../types';
import * as styles from './Link.css';

export interface LinkProps extends BaseComponentProps {
  /**
   * Link href
   */
  href?: string;

  /**
   * Click handler
   */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;

  /**
   * Whether the link is external (opens in new tab)
   * @default false
   */
  external?: boolean;

  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'tertiary';

  /**
   * Whether the link is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the link represents the current page/location
   * @default false
   */
  active?: boolean;

  /**
   * Link content
   */
  children: React.ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      onClick,
      external = false,
      variant = 'primary',
      disabled = false,
      active = false,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
      // Trigger click on Enter or Space key for accessibility
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLAnchorElement>);
      }
    };

    const externalProps = external
      ? {
          target: '_blank',
          rel: 'noopener noreferrer',
        }
      : {};

    return (
      <a
        ref={ref}
        href={href}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={clsx(
          styles.link({ colorVariant: active ? 'active' : variant, disabled }),
          className
        )}
        aria-disabled={disabled}
        aria-current={active ? 'page' : undefined}
        {...externalProps}
        {...rest}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = 'Link';
