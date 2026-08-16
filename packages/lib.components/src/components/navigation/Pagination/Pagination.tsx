import clsx from 'clsx';
import React, { forwardRef } from 'react';
import { Button } from '../../inputs/Button';
import { Box } from '../../layout/Box';
import { Typography } from '../../utility/Typography';
import * as styles from './Pagination.css';

// Types

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  page?: number; // Keep for backward compatibility
  currentPage?: number;
  totalCount?: number;
  limit?: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
  size?: 'small' | 'medium' | 'large';
  showFirstLast?: boolean; // Show first/last page buttons
  className?: string;
}

const ButtonContainer = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Box>) => (
  <Box
    display="flex"
    flexWrap="wrap"
    justifyContent="center"
    className={clsx(styles.buttonGap, className)}
    {...props}
  >
    {children}
  </Box>
);

type PaginationButtonProps = React.ComponentProps<typeof Button> & {
  active?: boolean;
};

const PaginationButton = ({
  size,
  className,
  ...props
}: PaginationButtonProps) => (
  <Button
    size={size}
    className={clsx(size === 'large' && styles.largeButton, className)}
    {...props}
  />
);

// Function to generate page numbers array with ellipsis
const generatePageNumbers = (
  currentPage: number,
  totalPages: number,
  maxButtons: number = 5
): (number | string)[] => {
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const halfButtons = Math.floor(maxButtons / 2);
  const showLeftDots = currentPage > halfButtons + 1;
  const showRightDots = currentPage < totalPages - halfButtons;

  if (!showLeftDots && showRightDots) {
    const leftPages = Array.from({ length: maxButtons - 1 }, (_, i) => i + 1);
    return [...leftPages, '...', totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightPages = Array.from(
      { length: maxButtons - 1 },
      (_, i) => totalPages - (maxButtons - 2) + i
    );
    return [1, '...', ...rightPages];
  }

  if (showLeftDots && showRightDots) {
    const middlePages = Array.from(
      { length: maxButtons - 4 },
      (_, i) => currentPage - Math.floor((maxButtons - 4) / 2) + i
    );
    return [1, '...', ...middlePages, '...', totalPages];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

/**
 * Pagination component for navigating through paginated data
 * @component
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalCount={100}
 *   limit={10}
 *   onPageChange={(page) => console.log(page)}
 * />
 * ```
 */
export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      page,
      currentPage,
      totalCount,
      totalPages,
      limit,
      onPageChange,
      showPageNumbers = false,
      maxPageButtons = 5,
      size = 'medium',
      showFirstLast = false,
      className,
      ...props
    },
    ref
  ) => {
    // Use currentPage if provided, otherwise fall back to page
    const activePage = currentPage ?? page ?? 1;

    // Calculate totalPages if not directly provided
    const actualTotalPages =
      totalPages ?? (totalCount && limit ? Math.ceil(totalCount / limit) : 1);

    // Only calculate from/to if we have totalCount and limit
    let from, to;
    if (totalCount !== undefined && limit !== undefined) {
      from = (activePage - 1) * limit + 1;
      to = Math.min(activePage * limit, totalCount);
    }

    const hasNextPage = activePage < actualTotalPages;
    const hasPreviousPage = activePage > 1;

    const pageNumbers = showPageNumbers
      ? generatePageNumbers(activePage, actualTotalPages, maxPageButtons)
      : [];

    return (
      <Box
        display="flex"
        flexDirection="column"
        className={className}
        ref={ref}
        {...props}
      >
        {totalCount !== undefined && limit !== undefined && (
          <Typography>
            Showing {from} to {to} of {totalCount} results
          </Typography>
        )}
        {!totalCount && (
          <Typography>
            Page {activePage} of {actualTotalPages}
          </Typography>
        )}
        <ButtonContainer>
          {showFirstLast && (
            <PaginationButton
              variant="secondary"
              onClick={() => onPageChange(1)}
              disabled={!hasPreviousPage}
              size={size}
              aria-label="First page"
            >
              First
            </PaginationButton>
          )}
          <PaginationButton
            variant="secondary"
            onClick={() => onPageChange(activePage - 1)}
            disabled={!hasPreviousPage}
            size={size}
            aria-label="Previous page"
          >
            Previous
          </PaginationButton>

          {showPageNumbers && (
            <ButtonContainer>
              {pageNumbers.map((pageNum, index) => {
                if (pageNum === '...') {
                  return (
                    <PaginationButton
                      key={`ellipsis-${index}`}
                      variant="secondary"
                      size={size}
                      disabled
                      aria-hidden="true"
                    >
                      ...
                    </PaginationButton>
                  );
                }

                return (
                  <PaginationButton
                    key={pageNum}
                    variant="secondary"
                    onClick={() => onPageChange(Number(pageNum))}
                    active={activePage === pageNum}
                    size={size}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={activePage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </PaginationButton>
                );
              })}
            </ButtonContainer>
          )}

          <PaginationButton
            variant="secondary"
            onClick={() => onPageChange(activePage + 1)}
            disabled={!hasNextPage}
            size={size}
            aria-label="Next page"
          >
            Next
          </PaginationButton>
          {showFirstLast && (
            <PaginationButton
              variant="secondary"
              onClick={() => onPageChange(actualTotalPages)}
              disabled={!hasNextPage}
              size={size}
              aria-label="Last page"
            >
              Last
            </PaginationButton>
          )}
        </ButtonContainer>
      </Box>
    );
  }
);

Pagination.displayName = 'Pagination';

/**
 * Simple Pagination component that only shows Previous/Next buttons
 */
export const SimplePagination = forwardRef<
  HTMLDivElement,
  Omit<PaginationProps, 'showPageNumbers' | 'maxPageButtons'>
>((props, ref) => {
  return <Pagination {...props} showPageNumbers={false} ref={ref} />;
});

SimplePagination.displayName = 'SimplePagination';

/**
 * Compact Pagination component for limited space
 */
export const CompactPagination = forwardRef<HTMLDivElement, PaginationProps>(
  (props, ref) => {
    return (
      <Pagination
        {...props}
        showPageNumbers
        maxPageButtons={3}
        className={`${props.className || ''} compact`}
        ref={ref}
      />
    );
  }
);

CompactPagination.displayName = 'CompactPagination';

export default Pagination;
