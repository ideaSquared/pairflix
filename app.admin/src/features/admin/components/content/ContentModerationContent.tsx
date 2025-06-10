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
  Modal,
  Select,
  Textarea,
  Typography,
} from '@pairflix/components';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';
import { admin } from '../../../../services/api';
import type { Theme } from '../../../../styles/theme';

interface StyledComponent {
  theme: Theme;
}

// Types for content items and reports
interface ContentItem {
  id: string;
  title: string;
  type: 'movie' | 'show' | 'episode';
  status: 'active' | 'pending' | 'flagged' | 'removed';
  reported_count: number;
  tmdb_id: string;
  created_at: string;
  updated_at: string;
  poster_path?: string;
}

interface ReportItem {
  id: string;
  user_name: string;
  reason: string;
  details?: string;
  created_at: string;
}

// Styled components
const ContentTypeBadge = styled(Badge)<{ contentType: string; theme: Theme }>`
  text-transform: capitalize;
`;

const SubHeading = styled(Typography)`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: ${({ theme }: StyledComponent) => theme.spacing.sm};
`;

const StyledCard = styled(Card)`
  margin-bottom: 10px;
  padding: 15px;
`;

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
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('reported_count');
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
        const response = await admin.content.getAll({
          limit: 10, // items per page
          offset: (page - 1) * 10, // calculate offset based on page number
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...(typeFilter ? { type: typeFilter } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(sortBy ? { sortBy } : {}),
          ...(sortOrder ? { sortOrder } : {}),
        });

        if (response && response.content) {
          setContentItems(response.content as unknown as ContentItem[]);
          if (response.pagination) {
            setTotalPages(Math.ceil(response.pagination.total / 10));
          }
        } else {
          throw new Error('Unexpected response format from server');
        }
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

  // Memoized event handlers to prevent unnecessary re-renders
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when search changes
  }, []);

  const handleTypeFilterChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setTypeFilter(e.target.value);
      setPage(1); // Reset to first page when filter changes
    },
    []
  );

  const handleStatusFilterChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(e.target.value);
      setPage(1); // Reset to first page when filter changes
    },
    []
  );

  const handleSortByChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setSortBy(e.target.value);
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

  // Memoized report dismissal
  const dismissReport = useCallback(
    async (reportId: string) => {
      try {
        await admin.content.dismissReport(reportId);
        setReports(reports.filter(report => report.id !== reportId));

        if (contentToReview) {
          const updatedContent = {
            ...contentToReview,
            reported_count: contentToReview.reported_count - 1,
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
    setSortBy('reported_count');
    setSortOrder('desc');
    setPage(1);
  }, []);

  // Memoized content saving
  const saveContentChanges = useCallback(
    async (updatedContent: ContentItem) => {
      try {
        await admin.content.update(updatedContent.id, updatedContent);
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
            <Alert variant="success" style={{ marginBottom: '1rem' }}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert variant="error" style={{ marginBottom: '1rem' }}>
              {errorMessage}
            </Alert>
          )}

          {/* Optimized Filters */}
          <Flex direction="column" gap="md" style={{ marginBottom: '1rem' }}>
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
                  <option value="reported_count">Reports</option>
                  <option value="created_at">Date</option>
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
              {/* Optimized content grid rendering would go here */}
              <Typography variant="body2" style={{ margin: '1rem 0' }}>
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
                <Typography style={{ alignSelf: 'center' }}>
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

      {/* Remove Content Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove Content"
      >
        <Typography gutterBottom>
          Are you sure you want to remove{' '}
          <strong>{contentToRemove?.title}</strong>? This will make the content
          unavailable to users.
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

        <Flex justifyContent="end" gap="md" style={{ marginTop: '20px' }}>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmRemoveContent}>
            Remove Content
          </Button>
        </Flex>
      </Modal>

      {/* Edit Content Modal */}
      {contentToEdit && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Content"
        >
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
                  setContentToEdit({ ...contentToEdit, title: e.target.value })
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
              <Typography style={{ marginBottom: '8px' }}>
                Content Type:
              </Typography>
              <ContentTypeBadge
                variant={getContentTypeVariant(contentToEdit.type)}
                contentType={contentToEdit.type}
              >
                {contentToEdit.type}
              </ContentTypeBadge>
              <Typography
                style={{
                  marginTop: '4px',
                  fontSize: '0.875rem',
                  color: '#666',
                }}
              >
                Content type cannot be changed
              </Typography>
            </div>

            <Flex justifyContent="end" gap="md" style={{ marginTop: '20px' }}>
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
        </Modal>
      )}

      {/* Review Reports Modal */}
      <Modal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        title="Review Reports"
      >
        {contentToReview && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <H4 gutterBottom>
                {contentToReview.title}{' '}
                <ContentTypeBadge
                  variant={getContentTypeVariant(contentToReview.type)}
                  contentType={contentToReview.type}
                >
                  {contentToReview.type}
                </ContentTypeBadge>
              </H4>
              <Typography>
                This content has been reported {contentToReview.reported_count}{' '}
                times
              </Typography>
            </div>

            {reports.length === 0 ? (
              <Typography>No active reports found for this content.</Typography>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <SubHeading gutterBottom>Reports</SubHeading>
                  {reports.map((report: ReportItem) => (
                    <StyledCard key={report.id}>
                      <Flex justifyContent="space-between" alignItems="start">
                        <div>
                          <Typography style={{ fontWeight: 'bold' }}>
                            Reported by: {report.user_name} on{' '}
                            {new Date(report.created_at).toLocaleDateString()}
                          </Typography>
                          <Typography style={{ marginTop: '8px' }}>
                            Reason: {report.reason}
                          </Typography>
                          {report.details && (
                            <Typography style={{ marginTop: '8px' }}>
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
                    </StyledCard>
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
      </Modal>
    </div>
  );
};

export default React.memo(ContentModerationContent);
