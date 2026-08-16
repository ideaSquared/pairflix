import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import type { Theme } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';
import { section } from './Section.css';

export type SectionProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  /**
   * Vertical spacing for the section
   * @default 'xl'
   */
  spacing?: keyof Theme['spacing'];

  /**
   * Whether the section should take full width
   * @default false
   */
  isFullWidth?: boolean;

  /**
   * Whether to disable spacing on mobile
   * @default false
   */
  noSpacingOnMobile?: boolean;

  /**
   * Background color from theme
   */
  background?: keyof Theme['colors']['background'];

  /**
   * Custom background color
   */
  customBackground?: string;

  /**
   * Section content
   */
  children: ReactNode;

  /**
   * Custom spacing for different breakpoints
   */
  responsiveSpacing?: {
    mobile?: keyof Theme['spacing'];
    tablet?: keyof Theme['spacing'];
    desktop?: keyof Theme['spacing'];
  };
};

export const Section = ({
  spacing = 'xl',
  isFullWidth = false,
  noSpacingOnMobile = false,
  background,
  customBackground,
  children,
  responsiveSpacing,
  className,
  style,
  ...rest
}: SectionProps) => {
  const cssVars = {
    ...(responsiveSpacing?.desktop && {
      '--section-spacing-desktop': vars.spacing[responsiveSpacing.desktop],
    }),
    ...(responsiveSpacing?.tablet && {
      '--section-spacing-tablet': vars.spacing[responsiveSpacing.tablet],
    }),
    ...(noSpacingOnMobile
      ? { '--section-spacing-mobile': '0' }
      : responsiveSpacing?.mobile
        ? {
            '--section-spacing-mobile': vars.spacing[responsiveSpacing.mobile],
          }
        : {}),
  };

  return (
    <section
      className={clsx(section({ spacing }), className)}
      style={
        {
          ...cssVars,
          width: isFullWidth ? '100%' : 'auto',
          background:
            customBackground ||
            (background ? vars.colors.background[background] : 'transparent'),
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </section>
  );
};
