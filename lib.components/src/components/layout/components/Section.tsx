import { ReactNode } from 'react';
import styled from 'styled-components';
import { Theme } from '../../../styles/theme';
import { media } from '../utils/responsive';

export interface SectionProps {
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
}

export const Section = styled.section<SectionProps>`
  width: ${({ isFullWidth }) => (isFullWidth ? '100%' : 'auto')};
  background: ${({ background, customBackground, theme }) =>
    customBackground ||
    (background ? theme.colors.background[background] : 'transparent')};

  padding-top: ${({ spacing = 'xl', theme }) => theme.spacing[spacing]};
  padding-bottom: ${({ spacing = 'xl', theme }) => theme.spacing[spacing]};

  /* Responsive spacing adjustments */
  @media ${media.desktop} {
    padding-top: ${({ responsiveSpacing, spacing = 'xl', theme }) =>
      theme.spacing[responsiveSpacing?.desktop || spacing]};
    padding-bottom: ${({ responsiveSpacing, spacing = 'xl', theme }) =>
      theme.spacing[responsiveSpacing?.desktop || spacing]};
  }

  @media ${media.tablet} {
    padding-top: ${({ responsiveSpacing, spacing = 'xl', theme }) =>
      theme.spacing[responsiveSpacing?.tablet || spacing]};
    padding-bottom: ${({ responsiveSpacing, spacing = 'xl', theme }) =>
      theme.spacing[responsiveSpacing?.tablet || spacing]};
  }

  @media ${media.mobile} {
    padding-top: ${({
      noSpacingOnMobile,
      responsiveSpacing,
      spacing = 'xl',
      theme,
    }) =>
      noSpacingOnMobile
        ? '0'
        : theme.spacing[
            responsiveSpacing?.mobile ||
              (spacing === 'xl' ? 'lg' : spacing === 'lg' ? 'md' : spacing)
          ]};
    padding-bottom: ${({
      noSpacingOnMobile,
      responsiveSpacing,
      spacing = 'xl',
      theme,
    }) =>
      noSpacingOnMobile
        ? '0'
        : theme.spacing[
            responsiveSpacing?.mobile ||
              (spacing === 'xl' ? 'lg' : spacing === 'lg' ? 'md' : spacing)
          ]};
  }
`;
