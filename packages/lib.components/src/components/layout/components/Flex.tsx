import type { CSSProperties, HTMLAttributes } from 'react';
import clsx from 'clsx';
import type { Theme } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';
import { flex, mobileStretchChildren } from './Flex.css';

export type FlexProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Flex direction
   * @default 'row'
   */
  direction?: 'row' | 'column';

  /**
   * Gap between flex items
   * @default 'md'
   */
  gap?: keyof Theme['spacing'];

  /**
   * Cross-axis alignment of flex items
   * @default 'stretch'
   */
  alignItems?:
    | 'start'
    | 'center'
    | 'end'
    | 'stretch'
    | 'flex-start'
    | 'flex-end'
    | 'baseline';

  /**
   * Main-axis alignment of flex items
   * @default 'start'
   */
  justifyContent?:
    | 'start'
    | 'center'
    | 'end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | 'flex-start'
    | 'flex-end';

  /**
   * Wrapping behavior
   * @default 'nowrap'
   */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';

  /**
   * Direction on mobile devices
   */
  mobileDirection?: 'row' | 'column';

  /**
   * Direction on tablet devices
   */
  tabletDirection?: 'row' | 'column';

  /**
   * Gap between items on mobile
   */
  mobileGap?: keyof Theme['spacing'];

  /**
   * Whether to take full width
   * @default false
   */
  isFullWidth?: boolean;

  /**
   * Whether to take full height
   * @default false
   */
  fullHeight?: boolean;

  /**
   * CSS flex property
   */
  flex?: string;

  /**
   * CSS flex-grow property
   */
  grow?: number;

  /**
   * CSS flex-shrink property
   */
  shrink?: number;

  /**
   * CSS flex-basis property
   */
  basis?: string;

  /**
   * Whether to center items both horizontally and vertically
   * @default false
   */
  center?: boolean;

  /**
   * Whether to reverse the direction
   * @default false
   */
  reverse?: boolean;

  /**
   * Inline flex display
   * @default false
   */
  inline?: boolean;
};

const resolveDirection = (direction: 'row' | 'column', reverse: boolean) =>
  direction === 'row'
    ? reverse
      ? 'row-reverse'
      : 'row'
    : reverse
      ? 'column-reverse'
      : 'column';

export const Flex = ({
  direction = 'row',
  gap = 'md',
  alignItems = 'stretch',
  justifyContent = 'start',
  wrap = 'nowrap',
  mobileDirection,
  tabletDirection,
  mobileGap,
  isFullWidth = false,
  fullHeight = false,
  flex: flexProp,
  grow,
  shrink,
  basis,
  center = false,
  reverse = false,
  inline = false,
  className,
  style,
  children,
  ...rest
}: FlexProps) => {
  const tabletDirectionValue = tabletDirection
    ? reverse
      ? `${tabletDirection}-reverse`
      : tabletDirection
    : resolveDirection(direction, reverse);

  const mobileDirectionValue = mobileDirection
    ? reverse
      ? `${mobileDirection}-reverse`
      : mobileDirection
    : direction === 'row'
      ? 'column'
      : direction;

  const mobileGapKey = mobileGap || (gap === 'lg' || gap === 'xl' ? 'md' : gap);

  const stretchChildrenOnMobile =
    direction === 'row' || mobileDirection === 'column';

  return (
    <div
      className={clsx(
        flex,
        stretchChildrenOnMobile && mobileStretchChildren,
        className
      )}
      style={
        {
          '--flex-direction-base': resolveDirection(direction, reverse),
          '--flex-direction-tablet': tabletDirectionValue,
          '--flex-direction-mobile': mobileDirectionValue,
          '--flex-gap-base': vars.spacing[gap],
          '--flex-gap-mobile': vars.spacing[mobileGapKey],
          display: inline ? 'inline-flex' : 'flex',
          alignItems: center ? 'center' : alignItems,
          justifyContent: center ? 'center' : justifyContent,
          flexWrap: wrap,
          width: isFullWidth ? '100%' : 'auto',
          height: fullHeight ? '100%' : 'auto',
          ...(flexProp && { flex: flexProp }),
          ...(grow !== undefined && { flexGrow: grow }),
          ...(shrink !== undefined && { flexShrink: shrink }),
          ...(basis && { flexBasis: basis }),
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </div>
  );
};
