import type { CSSProperties, HTMLAttributes } from 'react';
import clsx from 'clsx';
import type { Theme } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';
import { grid } from './Grid.css';

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Number of columns or custom grid template
   * @default 1
   */
  columns?: number | string;

  /**
   * Gap between grid items
   * @default 'md'
   */
  gap?: keyof Theme['spacing'];

  /**
   * Vertical alignment of grid items
   * @default 'stretch'
   */
  alignItems?: 'start' | 'center' | 'end' | 'stretch';

  /**
   * Horizontal alignment of grid items
   * @default 'start'
   */
  justifyContent?:
    | 'start'
    | 'center'
    | 'end'
    | 'space-between'
    | 'space-around'
    | 'flex-start'
    | 'flex-end';

  /**
   * Number of columns on mobile devices
   */
  mobileColumns?: number | string;

  /**
   * Number of columns on tablet devices
   */
  tabletColumns?: number | string;

  /**
   * Number of columns on desktop devices
   */
  desktopColumns?: number | string;

  /**
   * Whether to auto-fit columns to available space
   * @default false
   */
  autoFit?: boolean;

  /**
   * Minimum width of auto-fit columns
   */
  minColWidth?: string;
};

const colsValue = (columns: number | string) =>
  typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns;

export const Grid = ({
  columns = 1,
  gap = 'md',
  alignItems = 'stretch',
  justifyContent = 'start',
  mobileColumns,
  tabletColumns,
  desktopColumns,
  autoFit = false,
  minColWidth,
  className,
  style,
  children,
  ...rest
}: GridProps) => {
  const baseCols =
    autoFit && minColWidth
      ? `repeat(auto-fit, minmax(${minColWidth}, 1fr))`
      : colsValue(columns);

  const desktopCols =
    desktopColumns !== undefined
      ? colsValue(desktopColumns)
      : colsValue(columns);

  const tabletCols =
    tabletColumns !== undefined
      ? colsValue(tabletColumns)
      : typeof columns === 'number'
        ? `repeat(${Math.min(columns, 2)}, 1fr)`
        : columns;

  const mobileCols =
    mobileColumns !== undefined
      ? colsValue(mobileColumns)
      : autoFit && minColWidth
        ? `repeat(auto-fit, minmax(${minColWidth}, 1fr))`
        : '1fr';

  return (
    <div
      className={clsx(grid, className)}
      style={
        {
          '--grid-cols-base': baseCols,
          '--grid-cols-desktop': desktopCols,
          '--grid-cols-tablet': tabletCols,
          '--grid-cols-mobile': mobileCols,
          gap: vars.spacing[gap],
          alignItems,
          justifyContent,
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </div>
  );
};
