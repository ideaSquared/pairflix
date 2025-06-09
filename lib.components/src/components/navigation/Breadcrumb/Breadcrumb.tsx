import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { BaseComponentProps } from '../../../types';
import { Link } from '../Link';

export interface BreadcrumbItem {
  /**
   * Label to display for the item
   */
  label: string;

  /**
   * URL for the item
   */
  href?: string;

  /**
   * Click handler (optional)
   */
  onClick?: () => void;
}

export interface BreadcrumbProps extends BaseComponentProps {
  /**
   * Array of breadcrumb items to display
   */
  items: BreadcrumbItem[];

  /**
   * Custom separator between items
   * @default '/'
   */
  separator?: string | React.ReactNode;

  /**
   * Maximum items to show before truncating
   * Shows first, last, and current with ellipsis
   * @default undefined (show all)
   */
  maxItems?: number;
}

const BreadcrumbContainer = styled.nav`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme?.spacing?.xs || '4px'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '14px'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666'};
`;

const Separator = styled.span`
  margin: 0 ${({ theme }) => theme?.spacing?.xs || '4px'};
  user-select: none;
`;

const BreadcrumbText = styled.span`
  color: ${({ theme }) => theme?.colors?.text?.primary || '#000'};
`;

const BreadcrumbList = styled.ol`
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
`;

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = '/', maxItems, className, ...rest }, ref) => {
    const displayItems =
      maxItems && items.length > maxItems
        ? [...items.slice(0, 1), { label: '...' }, ...items.slice(-2)]
        : items;

    return (
      <BreadcrumbContainer
        ref={ref}
        className={className}
        aria-label="Breadcrumb"
        {...rest}
      >
        <BreadcrumbList role="list">
          {displayItems.map((item, index) => {
            const isLast = index === displayItems.length - 1;
            const isEllipsis = item.label === '...';

            return (
              <BreadcrumbItem key={item.label + index} role="listitem">
                {isEllipsis ? (
                  <BreadcrumbText aria-hidden>{item.label}</BreadcrumbText>
                ) : isLast ? (
                  <BreadcrumbText aria-current="page">
                    {item.label}
                  </BreadcrumbText>
                ) : (
                  <Link
                    href={item.href}
                    onClick={item.onClick}
                    variant="secondary"
                  >
                    {item.label}
                  </Link>
                )}
                {!isLast && (
                  <Separator aria-hidden="true">{separator}</Separator>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </BreadcrumbContainer>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';
