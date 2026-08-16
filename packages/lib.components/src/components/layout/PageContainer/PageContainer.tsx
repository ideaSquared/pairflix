import type { ReactNode } from 'react';
import clsx from 'clsx';
import { pageContainer } from './PageContainer.css';

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
export const PageContainer = ({
  children,
  className,
  maxWidth = 'lg',
  padding = 'md',
  centered = true,
  fullHeight = false,
  responsive = true,
}: PageContainerProps) => {
  return (
    <div
      className={clsx(
        pageContainer({ maxWidth, padding, centered, fullHeight, responsive }),
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageContainer;
