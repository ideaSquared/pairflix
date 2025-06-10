import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

export interface PageContainerProps {
  /** Maximum width of the container */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether the container should be centered */
  centered?: boolean;
  /** Whether the container should take full height */
  fullHeight?: boolean;
  /** Whether to apply responsive padding adjustments */
  responsive?: boolean;
  /** Custom className */
  className?: string;
  /** Children content */
  children: ReactNode;
}

const StyledPageContainer = styled.div<PageContainerProps>`
  width: 100%;
  margin-left: ${({ centered = true }) => (centered ? 'auto' : '0')};
  margin-right: ${({ centered = true }) => (centered ? 'auto' : '0')};
  height: ${({ fullHeight }) => (fullHeight ? '100%' : 'auto')};

  ${({ maxWidth = 'lg', theme }) => {
    if (maxWidth === 'full') return 'max-width: 100%;';
    return `max-width: ${theme.breakpoints?.[maxWidth] || '1200px'};`;
  }}

  ${({ padding = 'md', theme, responsive = true }) => {
    if (padding === 'none') return '';

    const paddingValue = theme.spacing?.[padding] || '1rem';

    return css`
      padding: ${paddingValue};

      ${responsive &&
      css`
        @media (max-width: 768px) {
          padding: ${padding === 'xl' || padding === 'lg'
            ? theme.spacing?.md || '1rem'
            : theme.spacing?.sm || '0.5rem'};
        }

        @media (max-width: 576px) {
          padding: ${theme.spacing?.sm || '0.5rem'};
        }
      `}
    `;
  }}
`;

/**
 * PageContainer - Consistent content container for pages
 *
 * Provides standardized spacing, max-width constraints, and responsive behavior
 * for page content within the AppLayout system.
 *
 * @example
 * <PageContainer maxWidth="lg" padding="xl">
 *   <h1>Page Title</h1>
 *   <p>Page content...</p>
 * </PageContainer>
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <StyledPageContainer className={className} {...props}>
      {children}
    </StyledPageContainer>
  );
};

export default PageContainer;
