import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { BaseComponentProps } from '../../../types';

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

const StyledLink = styled.a<{
  $variant?: LinkProps['variant'];
  $disabled?: boolean;
  $active?: boolean;
}>`
  color: ${({ theme, $variant, $active }) => {
    if ($active) return theme?.colors?.primary;
    switch ($variant) {
      case 'secondary':
        return theme?.colors?.text?.secondary;
      case 'tertiary':
        return theme?.colors?.text?.tertiary;
      default:
        return theme?.colors?.primary;
    }
  }};
  text-decoration: none;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  transition: color 0.2s ease;

  &:hover:not(:disabled) {
    text-decoration: underline;
    color: ${({ theme }) => theme?.colors?.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme?.colors?.primary};
    outline-offset: 2px;
  }
`;

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
      <StyledLink
        ref={ref}
        href={href}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={className}
        $variant={variant}
        $disabled={disabled}
        $active={active}
        aria-disabled={disabled}
        aria-current={active ? 'page' : undefined}
        {...externalProps}
        {...rest}
      >
        {children}
      </StyledLink>
    );
  }
);

Link.displayName = 'Link';
