import clsx from 'clsx';
import React, { forwardRef } from 'react';
import type { BaseComponentProps } from '../../../types';
import { Link } from '../Link';
import * as styles from './Breadcrumb.css';

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

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = '/', maxItems, className, ...rest }, ref) => {
    const displayItems =
      maxItems && items.length > maxItems
        ? [...items.slice(0, 1), { label: '...' }, ...items.slice(-2)]
        : items;

    return (
      <nav
        ref={ref}
        className={clsx(styles.container, className)}
        aria-label="Breadcrumb"
        {...rest}
      >
        <ol className={styles.list}>
          {displayItems.map((item, index) => {
            const isLast = index === displayItems.length - 1;
            const isEllipsis = item.label === '...';

            return (
              <li className={styles.item} key={item.label + index}>
                {isEllipsis ? (
                  <span className={styles.text} aria-hidden>
                    {item.label}
                  </span>
                ) : isLast ? (
                  <span className={styles.text} aria-current="page">
                    {item.label}
                  </span>
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
                  <span className={styles.separator} aria-hidden="true">
                    {separator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';
