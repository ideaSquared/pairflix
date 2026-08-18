import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Flex,
  H2,
  H4,
  Input,
  Select,
  Table,
  TableActionButton,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  Textarea,
  Typography,
} from '@pairflix/components';
import React, {
  type ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { admin } from '../../../../services/api';
import type {
  AdminContentSummary,
  ContentReport,
  ContentStatus,
  ContentType,
} from '../../../../services/api/admin';
import * as styles from './ContentModerationContent.css';

type ContentItem = AdminContentSummary;
type ReportItem = ContentReport;

// Performance hook for debouncing
const useDebounced = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ContentModerationContent: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContentType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | ''>('');
  const [sortBy, setSortBy] = useState<'reportedCount' | 'createdAt' | 'title'>(
    'reportedCount'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Delete/Remove Modal states
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [contentToRemove, setContentToRemove] = useState<ContentItem | null>(
    null
  );
  const [removalReason, setRemovalReason] = useState('');

  // Edit Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [contentToEdit, setContentToEdit] = useState<ContentItem | null>(null);

  // Review Reports Modal states
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [contentToReview, setContentToReview] = useState<ContentItem | null>(
    null
  );
  const [reports, setReports] = useState<ReportItem[]>([]);

  // Success/Error message states
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Debounced search for better performance
  const debouncedSearch = useDebounced(search, 500);

  // Memoized fetch function to avoid unnecessary recreations
  const fetchContentItems = useCallback(
    async (retryCount = 0) => {
      try {
        setIsLoading(true);

        // Call the admin API
        const response = await admin.content.list({
          page,
          limit: 10, // items per page
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...(typeFilter ? { type: typeFilter } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(sortBy ? { sortBy } : {}),
          ...(sortOrder ? { sortOrder } : {}),
        });

        setContentItems(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching content items:', error);

        // Retry logic for network issues (up to 2 retries)
        if (retryCount < 2) {
          setErrorMessage('Connection issue, retrying...');
          setTimeout(() => {
            fetchContentItems(retryCount + 1);
          }, 1500);
          return;
        }

        // More descriptive error messages based on error type
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setErrorMessage(
            'Network error: Unable to connect to the API. Please check your connection.'
          );
        } else if (
          error instanceof Error &&
          (error as Error & { response?: { status: number } }).response
            ?.status === 401
        ) {
          setErrorMessage('Authorization error: Please log in again.');
        } else if (
          error instanceof Error &&
          (error as Error & { response?: { status: number } }).response
            ?.status === 403
        ) {
          setErrorMessage(
            'Permission denied: You do not have access to content management.'
          );
        } else {
          setErrorMessage(
            'Failed to fetch content. Please try again or contact support.'
          );
        }
      } finally {
        if (retryCount === 0 || retryCount >= 2) {
          setIsLoading(false);
        }
      }
    },
    [page, debouncedSearch, typeFilter, statusFilter, sortBy, sortOrder]
  );

  useEffect(() => {
    fetchContentItems();
  }, [fetchContentItems]);

  // Show success message temporarily
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Show error message temporarily
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Close on Escape -- these are hand-rolled dialogs (see CreateUserModal.tsx),
  // not the shared Modal, so this isn't provided for free.
  useEffect(() => {
    if (!showRemoveModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowRemoveModal(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showRemoveModal]);

  useEffect(() => {
    if (!showEditModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowEditModal(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showEditModal]);

  useEffect(() => {
    if (!showReportsModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowReportsModal(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showReportsModal]);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when search changes
  }, []);

  const handleTypeFilterChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setTypeFilter(e.target.value as ContentType | '');
      setPage(1); // Reset to first page when filter changes
    },
    []
  );

  const handleStatusFilterChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(e.target.value as ContentStatus | '');
      setPage(1); // Reset to first page when filter changes
    },
    []
  );

  const handleSortByChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setSortBy(e.target.value as 'reportedCount' | 'createdAt' | 'title');
    },
    []
  );

  const handleSortOrderChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setSortOrder(e.target.value as 'asc' | 'desc');
    },
    []
  );

  // Memoized pagination handler
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Memoized content actions
  const handleRemoveContent = useCallback((content: ContentItem) => {
    setContentToRemove(content);
    setRemovalReason('');
    setShowRemoveModal(true);
  }, []);

  const handleEditContent = useCallback((content: ContentItem) => {
    setContentToEdit(content);
    setShowEditModal(true);
  }, []);

  const handleReviewReports = useCallback(async (content: ContentItem) => {
    setContentToReview(content);
    setReports([]);
    setShowReportsModal(true);
    try {
      const fetchedReports = await admin.content.reports(content.id);
      setReports(fetchedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setErrorMessage('Failed to load reports. Please try again.');
    }
  }, []);

  // Memoized report dismissal
  const dismissReport = useCallback(
    async (reportId: string) => {
      try {
        await admin.content.dismissReport(reportId);
        setReports(reports.filter(report => report.id !== reportId));

        if (contentToReview) {
          const updatedContent = {
            ...contentToReview,
            reportedCount: contentToReview.reportedCount - 1,
          };
          setContentToReview(updatedContent);
          setContentItems(
            contentItems.map(item =>
              item.id === updatedContent.id ? updatedContent : item
            )
          );
        }

        setSuccessMessage('Report dismissed successfully');
      } catch (error) {
        console.error('Error dismissing report:', error);
        setErrorMessage('Failed to dismiss report. Please try again.');
      }
    },
    [reports, contentToReview, contentItems]
  );

  // Memoized content approval
  const approveContent = useCallback(
    async (content: ContentItem) => {
      try {
        await admin.content.approve(content.id);
        const updatedContent = { ...content, status: 'active' as const };
        setContentItems(
          contentItems.map(item =>
            item.id === updatedContent.id ? updatedContent : item
          )
        );
        setSuccessMessage('Content approved successfully');
      } catch (error) {
        console.error('Error approving content:', error);
        setErrorMessage('Failed to approve content. Please try again.');
      }
    },
    [contentItems]
  );

  // Memoized filter clearing
  const clearFilters = useCallback(() => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
    setSortBy('reportedCount');
    setSortOrder('desc');
    setPage(1);
  }, []);

  // Memoized content saving
  const saveContentChanges = useCallback(
    async (updatedContent: ContentItem) => {
      try {
        await admin.content.update(updatedContent.id, {
          title: updatedContent.title,
          status: updatedContent.status,
        });
        setContentItems(
          contentItems.map(item =>
            item.id === updatedContent.id ? updatedContent : item
          )
        );
        setSuccessMessage('Content updated successfully');
        setShowEditModal(false);
      } catch (error) {
        console.error('Error updating content:', error);
        setErrorMessage('Failed to update content. Please try again.');
      }
    },
    [contentItems]
  );

  // Memoized content removal confirmation
  const confirmRemoveContent = useCallback(async () => {
    if (!contentToRemove) return;

    try {
      await admin.content.remove(contentToRemove.id, removalReason);
      setContentItems(
        contentItems.filter(item => item.id !== contentToRemove.id)
      );
      setSuccessMessage('Content removed successfully');
      setShowRemoveModal(false);
    } catch (error) {
      console.error('Error removing content:', error);
      setErrorMessage('Failed to remove content. Please try again.');
    }
  }, [contentToRemove, removalReason, contentItems]);

  // Memoized variant functions
  const getContentTypeVariant = useMemo(
    () =>
      (type: string): 'error' | 'warning' | 'info' | 'success' | 'default' => {
        switch (type) {
          case 'movie':
            return 'info';
          case 'show':
            return 'success';
          case 'episode':
            return 'warning';
          default:
            return 'default';
        }
      },
    []
  );

  // Memoized status variant function
  const getContentStatusVariant = useMemo(
    () =>
      (
        status: string
      ): 'error' | 'warning' | 'info' | 'success' | 'default' => {
        switch (status) {
          case 'active':
            return 'success';
          case 'pending':
            return 'warning';
          case 'flagged':
            return 'error';
          default:
            return 'default';
        }
      },
    []
  );

  // Memoized filtered content for better performance
  const filteredContent = useMemo(() => {
    return contentItems; // Already filtered by server-side API
  }, [contentItems]);

  return (
    <div>
      {/* Performance-optimized filters and content rendering */}
      <Card>
        <CardHeader>
          <H2>Content Moderation</H2>
          <Typography variant="body2">
            Manage and moderate user-generated content
            {filteredContent.length > 0 && ` (${filteredContent.length} items)`}
          </Typography>
        </CardHeader>
        <CardContent>
          {/* Success/Error Messages */}
          {successMessage && (
            <Alert variant="success" className={styles.alertSpacing}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert variant="error" className={styles.alertSpacing}>
              {errorMessage}
            </Alert>
          )}

          {/* Optimized Filters */}
          <Flex direction="column" gap="md" className={styles.filterBar}>
            <Flex direction="row" gap="sm" wrap="wrap">
              <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
                <Input
                  type="text"
                  placeholder="Search content..."
                  value={search}
                  onChange={handleSearchChange}
                  isFullWidth
                />
              </div>
              <div style={{ flex: '0 0 120px' }}>
                <Select
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                  isFullWidth
                >
                  <option value="">All Types</option>
                  <option value="movie">Movies</option>
                  <option value="show">TV Shows</option>
                  <option value="episode">Episodes</option>
                </Select>
              </div>
              <div style={{ flex: '0 0 120px' }}>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  isFullWidth
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="flagged">Flagged</option>
                  <option value="removed">Removed</option>
                </Select>
              </div>
              <div style={{ flex: '0 0 100px' }}>
                <Select
                  value={sortBy}
                  onChange={handleSortByChange}
                  isFullWidth
                >
                  <option value="reportedCount">Reports</option>
                  <option value="createdAt">Date</option>
                  <option value="title">Title</option>
                </Select>
              </div>
              <div style={{ flex: '0 0 60px' }}>
                <Select
                  value={sortOrder}
                  onChange={handleSortOrderChange}
                  isFullWidth
                >
                  <option value="desc">↓</option>
                  <option value="asc">↑</option>
                </Select>
              </div>
            </Flex>
          </Flex>

          <Button onClick={clearFilters} variant="secondary" size="small">
            Clear Filters
          </Button>

          {/* Loading/Content display optimized for performance */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Typography>Loading content...</Typography>
            </div>
          ) : filteredContent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Typography>
                No content found matching the current filters.
              </Typography>
            </div>
          ) : (
            <>
              <TableContainer>
                <Table aria-label="Flagged content">
                  <TableHead>
                    <tr>
                      <TableHeaderCell>Title</TableHeaderCell>
                      <TableHeaderCell>Type</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Reports</TableHeaderCell>
                      <TableHeaderCell>Created</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {filteredContent.map(item => (
                      <tr key={item.id}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>
                          <Badge
                            className={styles.contentTypeBadge}
                            variant={getContentTypeVariant(item.type)}
                          >
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={styles.contentTypeBadge}
                            variant={getContentStatusVariant(item.status)}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.reportedCount}</TableCell>
                        <TableCell>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Flex gap="sm">
                            <TableActionButton
                              onClick={() => handleEditContent(item)}
                            >
                              Edit
                            </TableActionButton>
                            <TableActionButton
                              variant="danger"
                              onClick={() => handleRemoveContent(item)}
                            >
                              Remove
                            </TableActionButton>
                            <TableActionButton
                              onClick={() => handleReviewReports(item)}
                            >
                              Review Reports
                            </TableActionButton>
                          </Flex>
                        </TableCell>
                      </tr>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="body2" className={styles.resultsCount}>
                Showing {filteredContent.length} items (Page {page} of{' '}
                {totalPages})
              </Typography>

              {/* Pagination controls */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem',
                }}
              >
                <Button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  variant="secondary"
                  size="small"
                >
                  Previous
                </Button>
                <Typography className={styles.pageIndicator}>
                  Page {page} of {totalPages}
                </Typography>
                <Button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  variant="secondary"
                  size="small"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Remove Content Modal -- hand-rolled, see CreateUserModal.tsx */}
      {showRemoveModal && (
        <div className={styles.dialogOverlay}>
          <div
            className={styles.dialogContent}
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-content-title"
          >
            <h3 id="remove-content-title" className={styles.dialogTitle}>
              Remove Content
            </h3>

            <Typography gutterBottom>
              Are you sure you want to remove{' '}
              <strong>{contentToRemove?.title}</strong>? This will make the
              content unavailable to users.
            </Typography>

            <div style={{ marginBottom: '16px', marginTop: '16px' }}>
              <label
                htmlFor="removal-reason"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                Reason for Removal
              </label>{' '}
              <Textarea
                id="removal-reason"
                rows={3}
                value={removalReason}
                onChange={e => setRemovalReason(e.target.value)}
                placeholder="Explain why this content is being removed"
                isFullWidth
              />
            </div>

            <Flex justifyContent="end" gap="md" className={styles.modalFooter}>
              <Button
                variant="secondary"
                onClick={() => setShowRemoveModal(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmRemoveContent}>
                Remove Content
              </Button>
            </Flex>
          </div>
        </div>
      )}

      {/* Edit Content Modal -- hand-rolled, see CreateUserModal.tsx */}
      {showEditModal && contentToEdit && (
        <div className={styles.dialogOverlay}>
          <div
            className={styles.dialogContent}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-content-title"
          >
            <h3 id="edit-content-title" className={styles.dialogTitle}>
              Edit Content
            </h3>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (contentToEdit) saveContentChanges(contentToEdit);
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="content-title"
                  style={{ display: 'block', marginBottom: '8px' }}
                >
                  Title
                </label>
                <Input
                  id="content-title"
                  value={contentToEdit.title}
                  onChange={e =>
                    setContentToEdit({
                      ...contentToEdit,
                      title: e.target.value,
                    })
                  }
                  isFullWidth
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="content-status"
                  style={{ display: 'block', marginBottom: '8px' }}
                >
                  Status
                </label>
                <Select
                  id="content-status"
                  value={contentToEdit.status}
                  onChange={e =>
                    setContentToEdit({
                      ...contentToEdit,
                      status: e.target.value as ContentItem['status'],
                    })
                  }
                  isFullWidth
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="flagged">Flagged</option>
                  <option value="removed">Removed</option>
                </Select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Typography className={styles.fieldLabel}>
                  Content Type:
                </Typography>
                <Badge
                  className={styles.contentTypeBadge}
                  variant={getContentTypeVariant(contentToEdit.type)}
                >
                  {contentToEdit.type}
                </Badge>
                <Typography className={styles.contentTypeHint}>
                  Content type cannot be changed
                </Typography>
              </div>

              <Flex
                justifyContent="end"
                gap="md"
                className={styles.modalFooter}
              >
                <Button
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </Flex>
            </form>
          </div>
        </div>
      )}

      {/* Review Reports Modal -- hand-rolled, see CreateUserModal.tsx */}
      {showReportsModal && (
        <div className={styles.dialogOverlay}>
          <div
            className={styles.dialogContent}
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-reports-title"
          >
            <h3 id="review-reports-title" className={styles.dialogTitle}>
              Review Reports
            </h3>

            {contentToReview && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <H4 gutterBottom>
                    {contentToReview.title}{' '}
                    <Badge
                      className={styles.contentTypeBadge}
                      variant={getContentTypeVariant(contentToReview.type)}
                    >
                      {contentToReview.type}
                    </Badge>
                  </H4>
                  <Typography>
                    This content has been reported{' '}
                    {contentToReview.reportedCount} times
                  </Typography>
                </div>

                {reports.length === 0 ? (
                  <Typography>
                    No active reports found for this content.
                  </Typography>
                ) : (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <Typography className={styles.subHeading} gutterBottom>
                        Reports
                      </Typography>
                      {reports.map((report: ReportItem) => (
                        <Card className={styles.styledCard} key={report.id}>
                          <Flex
                            justifyContent="space-between"
                            alignItems="start"
                          >
                            <div>
                              <Typography className={styles.reporterName}>
                                Reported by: {report.reporterUsername} on{' '}
                                {new Date(
                                  report.createdAt
                                ).toLocaleDateString()}
                              </Typography>
                              <Typography className={styles.reportMeta}>
                                Reason: {report.reason}
                              </Typography>
                              {report.details && (
                                <Typography className={styles.reportMeta}>
                                  Details: {report.details}
                                </Typography>
                              )}
                            </div>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => dismissReport(report.id)}
                            >
                              Dismiss Report
                            </Button>
                          </Flex>
                        </Card>
                      ))}
                    </div>

                    <Flex justifyContent="space-between" gap="md">
                      <Button
                        variant="danger"
                        onClick={() => {
                          handleRemoveContent(contentToReview);
                          setShowReportsModal(false);
                        }}
                      >
                        Remove Content
                      </Button>
                      <Flex gap="md">
                        <Button
                          variant="secondary"
                          onClick={() => setShowReportsModal(false)}
                        >
                          Close
                        </Button>
                        {contentToReview.status !== 'active' && (
                          <Button
                            variant="primary"
                            onClick={() => {
                              approveContent(contentToReview);
                              setShowReportsModal(false);
                            }}
                          >
                            Approve Content
                          </Button>
                        )}
                      </Flex>
                    </Flex>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ContentModerationContent);
