import { ReactNode } from 'react';
import styled from 'styled-components';
import { Theme } from '../../../styles/theme';
import { media } from '../utils/responsive';

export interface ContainerProps {
  /**
   * Maximum width constraint
   * @default 'lg'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'none';

  /**
   * Container padding
   * @default 'md'
   */
  padding?: keyof Theme['spacing'];

  /**
   * Whether container should be fluid width
   * @default false
   */
  fluid?: boolean;

  /**
   * Whether container should be centered
   * @default true
   */
  centered?: boolean;

  /**
   * Whether container should take full width of parent
   * @default false
   */
  isFullWidth?: boolean;

  /**
   * Container content
   */
  children: ReactNode;

  /**
   * Custom width override
   */
  width?: string;

  /**
   * Custom min-width
   */
  minWidth?: string;

  /**
   * Custom max-width override
   */
  customMaxWidth?: string;

  /**
   * Whether to disable padding on mobile
   * @default false
   */
  noPaddingOnMobile?: boolean;

  /**
   * Custom padding values for different breakpoints
   */
  responsivePadding?: {
    mobile?: keyof Theme['spacing'];
    tablet?: keyof Theme['spacing'];
    desktop?: keyof Theme['spacing'];
  };
}

export const Container = styled.div<ContainerProps>`
  width: ${({ width, isFullWidth = false }) =>
    width ? width : isFullWidth ? '100%' : 'auto'};
  min-width: ${({ minWidth }) => minWidth};
  margin-left: ${({ centered = true }) => (centered ? 'auto' : '0')};
  margin-right: ${({ centered = true }) => (centered ? 'auto' : '0')};
  padding-left: ${({ padding = 'md', theme }) => theme.spacing[padding]};
  padding-right: ${({ padding = 'md', theme }) => theme.spacing[padding]};

  /* Max-width handling with precedence:
	1. customMaxWidth if provided
	2. none if fluid
	3. theme breakpoint based on maxWidth prop */
  max-width: ${({ customMaxWidth, maxWidth = 'lg', fluid = false, theme }) =>
    customMaxWidth
      ? customMaxWidth
      : fluid || maxWidth === 'none'
        ? 'none'
        : theme.breakpoints[maxWidth]};

  /* Responsive padding adjustments */
  @media ${media.desktop} {
    padding-left: ${({ responsivePadding, padding = 'md', theme }) =>
      theme.spacing[responsivePadding?.desktop || padding]};
    padding-right: ${({ responsivePadding, padding = 'md', theme }) =>
      theme.spacing[responsivePadding?.desktop || padding]};
  }

  @media ${media.tablet} {
    padding-left: ${({ responsivePadding, padding = 'md', theme }) =>
      theme.spacing[responsivePadding?.tablet || padding]};
    padding-right: ${({ responsivePadding, padding = 'md', theme }) =>
      theme.spacing[responsivePadding?.tablet || padding]};
  }

  @media ${media.mobile} {
    width: 100%; /* Always full width on mobile */
    padding-left: ${({
      noPaddingOnMobile,
      responsivePadding,
      padding = 'md',
      theme,
    }) =>
      noPaddingOnMobile
        ? '0'
        : theme.spacing[
            responsivePadding?.mobile ||
              (padding === 'lg' || padding === 'xl' ? 'md' : padding)
          ]};
    padding-right: ${({
      noPaddingOnMobile,
      responsivePadding,
      padding = 'md',
      theme,
    }) =>
      noPaddingOnMobile
        ? '0'
        : theme.spacing[
            responsivePadding?.mobile ||
              (padding === 'lg' || padding === 'xl' ? 'md' : padding)
          ]};
  }
`;
