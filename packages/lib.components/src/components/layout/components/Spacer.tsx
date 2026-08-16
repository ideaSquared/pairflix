import type { CSSProperties, HTMLAttributes } from 'react';
import clsx from 'clsx';
import type { Theme } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';
import { hideOnMobileClass, spacerBlock, spacerInline } from './Spacer.css';

export type SpacerProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Size of the spacer
   */
  size: keyof Theme['spacing'];

  /**
   * Whether the spacer should be responsive (reduce size on mobile)
   * @default false
   */
  responsive?: boolean;

  /**
   * Whether the spacer should be inline (horizontal) or block (vertical)
   * @default false (block/vertical)
   */
  inline?: boolean;

  /**
   * Whether to hide the spacer on mobile
   * @default false
   */
  hideOnMobile?: boolean;

  /**
   * Custom size for mobile viewport
   */
  mobileSize?: keyof Theme['spacing'];

  /**
   * Custom size for tablet viewport
   */
  tabletSize?: keyof Theme['spacing'];
};

const downgrade = (size: keyof Theme['spacing']): keyof Theme['spacing'] =>
  size === 'xl' || size === 'lg' ? 'md' : size === 'md' ? 'sm' : 'xs';

export const Spacer = ({
  size,
  responsive = false,
  inline = false,
  hideOnMobile = false,
  mobileSize,
  tabletSize,
  className,
  style,
  ...rest
}: SpacerProps) => {
  const mobileSizeKey = mobileSize || (responsive ? downgrade(size) : size);

  return (
    <div
      className={clsx(
        inline ? spacerInline : spacerBlock,
        hideOnMobile && hideOnMobileClass,
        className
      )}
      style={
        {
          '--spacer-size-base': vars.spacing[size],
          '--spacer-size-tablet': vars.spacing[tabletSize || size],
          '--spacer-size-mobile': vars.spacing[mobileSizeKey],
          ...style,
        } as CSSProperties
      }
      {...rest}
    />
  );
};
