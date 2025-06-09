import styled, { css } from 'styled-components';
import { Theme } from '../../../styles/theme';
import { media } from '../utils/responsive';

export interface SpacerProps {
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
}

export const Spacer = styled.div<SpacerProps>`
  height: ${({ size, inline, theme }) =>
    inline ? 'auto' : theme.spacing[size]};
  width: ${({ size, inline, theme }) =>
    inline ? theme.spacing[size] : '100%'};
  flex-shrink: 0;

  /* Responsive spacing */
  @media ${media.tablet} {
    height: ${({ size, tabletSize, inline, theme }) =>
      inline ? 'auto' : theme.spacing[tabletSize || size]};
    width: ${({ size, tabletSize, inline, theme }) =>
      inline ? theme.spacing[tabletSize || size] : '100%'};
  }

  @media ${media.mobile} {
    ${({ hideOnMobile }) =>
      hideOnMobile &&
      css`
        display: none;
      `}

    height: ${({ size, mobileSize, inline, responsive, theme }) =>
      inline
        ? 'auto'
        : theme.spacing[
            mobileSize ||
              (responsive
                ? ((size === 'xl' || size === 'lg'
                    ? 'md'
                    : size === 'md'
                      ? 'sm'
                      : 'xs') as keyof Theme['spacing'])
                : size)
          ]};
    width: ${({ size, mobileSize, inline, responsive, theme }) =>
      inline
        ? theme.spacing[
            mobileSize ||
              (responsive
                ? ((size === 'xl' || size === 'lg'
                    ? 'md'
                    : size === 'md'
                      ? 'sm'
                      : 'xs') as keyof Theme['spacing'])
                : size)
          ]
        : '100%'};
  }
`;
