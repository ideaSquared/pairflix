import {
  Badge,
  Button,
  Card,
  CardContent,
  CardGrid,
  Container,
  Flex,
  H1,
  H3,
  Input,
  InputGroup,
  PageContainer,
  Select,
  SelectGroup,
  TagFilter,
  TagInput,
  Typography,
} from '@pairflix/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import {
  user as userService,
  watchlist,
  WatchlistEntry,
} from '../../services/api';
import SearchMedia from './SearchMedia';

// Create a custom type for our WatchlistCard component that properly extends Card props
interface WatchlistCardProps {
  status: string;
  variant?: 'primary' | 'secondary' | 'outlined';
  children: React.ReactNode;
  className?: string;
  elevation?: 'low' | 'medium' | 'high';
  accentColor?: string;
  interactive?: boolean;
}

// Extend the Card component to include status prop
const WatchlistCard = styled(Card)<WatchlistCardProps>`
  border-left: 4px solid
    ${({ status, theme }) => {
      switch (status) {
        case 'to_watch':
          return theme.colors.status.toWatch;
        case 'watch_together_focused':
          return theme.colors.status.watchTogetherFocused;
        case 'watch_together_background':
          return theme.colors.status.watchTogetherBackground;
        case 'watching':
          return theme.colors.status.watching;
        case 'finished':
          return theme.colors.status.finished;
        default:
          return theme.colors.status.toWatch;
      }
    }};
`;

const TabButton = styled(Button)<{ $active: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.background.secondary};
  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primaryHover : theme.colors.border};
  }
`;

const RelativeCard = styled(CardContent)`
  position: relative;
`;

// Update the GridContainer for better space utilization across various screen sizes
const GridContainer = styled(CardGrid)`
  margin-top: ${({ theme }) => theme.spacing.lg};
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(280px, 1fr)
  ); // Base size adjusted
  gap: ${({ theme }) => theme.spacing.md};

  /* Better utilization of screen space across different devices */
  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  /* For larger screens, allow even more cards per row */
  @media (min-width: 1600px) {
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  }

  /* For extra large screens, maximize content density */
  @media (min-width: 2000px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
`;

// Enhanced List View item styling
const ListViewItem = styled(WatchlistCard)`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  width: 100%;

  ${RelativeCard} {
    flex: 1;
    display: flex;
    gap: ${({ theme }) => theme.spacing.lg};

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: ${({ theme }) => theme.spacing.sm};
    }

    .actions {
      display: flex;
      align-items: flex-start;
      padding-left: ${({ theme }) => theme.spacing.md};
    }
  }
`;

// Updated list container for better width utilization
const ListContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

type PreferenceResponse = {
  token: string;
  user: {
    preferences: {
      viewStyle: 'grid' | 'list';
      [key: string]: unknown;
    };
  };
};

const TagsSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors?.primary || '#4853db'};
  color: white;
  padding: 0.15rem 0.4rem;
  border-radius: ${({ theme }) => theme.borderRadius?.sm || '4px'};
  font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
`;

// Performance hooks for optimization
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

// Virtual scrolling configuration
const VIRTUAL_ITEM_HEIGHT = 400; // Approximate height of each item
const VIRTUAL_CONTAINER_HEIGHT = 600; // Height of the visible area
const VIRTUALIZATION_THRESHOLD = 50; // Enable virtualization for lists with 50+ items

// Memoized tag extraction function
const extractAllTags = (entries: WatchlistEntry[]): string[] => {
  const tags = new Set<string>();
  entries.forEach((entry: WatchlistEntry) => {
    if (entry.tags && Array.isArray(entry.tags)) {
      entry.tags.forEach((tag: string) => tags.add(tag));
    }
  });
  return Array.from(tags).sort();
};

// Memoized filtering function with performance optimizations
const filterEntries = (
  entries: WatchlistEntry[],
  searchQuery: string,
  selectedTags: string[]
): WatchlistEntry[] => {
  // Early return for no filters
  if (!searchQuery && selectedTags.length === 0) {
    return [...entries].sort((a, b) =>
      (a.title || '').localeCompare(b.title || '')
    );
  }

  const lowerSearchQuery = searchQuery.toLowerCase();

  const filtered = entries.filter((entry: unknown): entry is WatchlistEntry => {
    if (!entry || typeof entry !== 'object') return false;

    const castEntry = entry as Partial<WatchlistEntry>;
    if (!castEntry.entry_id || !castEntry.title) {
      console.warn('Invalid entry found:', entry);
      return false;
    }

    // Search query filter - use pre-lowercased query for better performance
    const matchesSearch =
      searchQuery === '' ||
      castEntry.title.toLowerCase().includes(lowerSearchQuery);

    // Tags filter - optimized with early returns
    const matchesTags =
      selectedTags.length === 0 ||
      (castEntry.tags &&
        selectedTags.some(tag => castEntry.tags?.includes(tag)));

    return matchesSearch && !!matchesTags;
  });

  // Apply stable sort by title to maintain consistent order
  return [...filtered].sort((a, b) =>
    (a.title || '').localeCompare(b.title || '')
  );
};

// Virtual scrolling container
const VirtualizedContainer = styled.div<{ height: number }>`
  height: ${props => props.height}px;
  overflow: auto;
  position: relative;
`;

const VirtualizedContent = styled.div<{ height: number }>`
  height: ${props => props.height}px;
  position: relative;
`;

// Simple virtualization hook
const useSimpleVirtualization = <T,>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
) => {
  return useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 5, // 5 item buffer
      items.length - 1
    );

    const visibleItems = [];
    for (let i = Math.max(0, startIndex - 5); i <= endIndex; i++) {
      if (items[i]) {
        visibleItems.push({
          item: items[i],
          index: i,
          top: i * itemHeight,
        });
      }
    }

    return {
      visibleItems,
      totalHeight: items.length * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);
};

// Memoized individual watchlist item component
interface WatchlistItemProps {
  entry: WatchlistEntry;
  viewStyle: 'grid' | 'list';
  isEditingTags: string | null;
  onStatusChange: (entryId: string, status: WatchlistEntry['status']) => void;
  onTagsChange: (entryId: string, tags: string[]) => void;
  onEditTags: (entryId: string | null) => void;
  style?: React.CSSProperties;
}

const WatchlistItem = React.memo<WatchlistItemProps>(
  ({
    entry,
    viewStyle,
    isEditingTags,
    onStatusChange,
    onTagsChange,
    onEditTags,
    style,
  }) => {
    const handleStatusChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onStatusChange(
          entry.entry_id,
          e.target.value as WatchlistEntry['status']
        );
      },
      [entry.entry_id, onStatusChange]
    );

    const handleTagsChange = useCallback(
      (tags: string[]) => {
        onTagsChange(entry.entry_id, tags);
      },
      [entry.entry_id, onTagsChange]
    );

    const handleEditTagsClick = useCallback(() => {
      onEditTags(entry.entry_id);
    }, [entry.entry_id, onEditTags]);

    const handleDoneEditing = useCallback(() => {
      onEditTags(null);
    }, [onEditTags]);

    const commonContent = useMemo(
      () => (
        <>
          <H3 gutterBottom>
            <Badge variant="primary">
              {entry.media_type === 'tv' ? 'TV Series' : 'Movie'}
            </Badge>{' '}
            {entry.title}
          </H3>
          <SelectGroup $isFullWidth>
            <Select
              value={entry.status}
              onChange={handleStatusChange}
              isFullWidth
            >
              <option value="to_watch">To Watch</option>
              <option value="watch_together_focused">
                Watch together (focused)
              </option>
              <option value="watch_together_background">
                Watch together (background)
              </option>
              <option value="watching">Watching</option>
              <option value="finished">Finished</option>
            </Select>
          </SelectGroup>
          {entry.notes && (
            <Typography variant="body2" gutterBottom>
              Notes: {entry.notes}
            </Typography>
          )}
          <TagsSection>
            {isEditingTags === entry.entry_id ? (
              <>
                <Typography variant="body2" gutterBottom>
                  Manage Tags:
                </Typography>
                <TagInput
                  tags={entry.tags || []}
                  onChange={handleTagsChange}
                  placeholder="Add tags..."
                />
                <Button
                  onClick={handleDoneEditing}
                  style={{ marginTop: '0.5rem' }}
                >
                  Done
                </Button>
              </>
            ) : (
              <>
                <Flex justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Tags:</Typography>
                  <Button variant="text" onClick={handleEditTagsClick}>
                    Edit Tags
                  </Button>
                </Flex>
                <TagsContainer>
                  {entry.tags && entry.tags.length > 0 ? (
                    entry.tags.map((tag, idx) => <Tag key={idx}>{tag}</Tag>)
                  ) : (
                    <Typography variant="caption">No tags added</Typography>
                  )}
                </TagsContainer>
              </>
            )}
          </TagsSection>
        </>
      ),
      [
        entry.media_type,
        entry.title,
        entry.status,
        entry.notes,
        entry.tags,
        entry.entry_id,
        isEditingTags,
        handleStatusChange,
        handleTagsChange,
        handleEditTagsClick,
        handleDoneEditing,
      ]
    );

    const itemContent =
      viewStyle === 'grid' ? (
        <WatchlistCard
          status={entry.status}
          data-testid={`movie-item-${entry.entry_id}`}
        >
          <RelativeCard>{commonContent}</RelativeCard>
        </WatchlistCard>
      ) : (
        <ListViewItem
          status={entry.status}
          data-testid={`movie-item-${entry.entry_id}`}
        >
          <RelativeCard>{commonContent}</RelativeCard>
        </ListViewItem>
      );

    // Wrap in positioned container if style is provided (for virtualization)
    return style ? <div style={style}>{itemContent}</div> : itemContent;
  }
);

WatchlistItem.displayName = 'WatchlistItem';

const WatchlistPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'search'>('list');
  const [viewStyle, setViewStyle] = useState(
    user?.preferences?.viewStyle || 'grid'
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isEditingTags, setIsEditingTags] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounced(searchQuery, 300);

  const preferenceMutation = useMutation<
    PreferenceResponse,
    Error,
    'grid' | 'list'
  >({
    mutationFn: (viewStyle: 'grid' | 'list') =>
      userService.updatePreferences({ viewStyle }),
    onSuccess: response => {
      if (response.token) {
        localStorage.setItem('token', response.token);
        queryClient.invalidateQueries(['auth']);
      }
    },
  });

  const updateMutation = useMutation(
    ({ id, updates }: { id: string; updates: Partial<WatchlistEntry> }) =>
      watchlist.update(id, updates),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries(['watchlist']);
      },
    }
  );

  // Update useEffect to sync with user preferences
  useEffect(() => {
    if (user?.preferences?.viewStyle) {
      setViewStyle(user.preferences.viewStyle);
    }
  }, [user?.preferences?.viewStyle]);

  const {
    data: entries = [],
    isLoading,
    error,
  } = useQuery(['watchlist'], watchlist.getAll, {
    retry: 3,
    staleTime: 30000,
  });

  // Memoized callbacks for better performance
  const handleStatusChange = useCallback(
    (entryId: string, status: WatchlistEntry['status']) => {
      updateMutation.mutate({ id: entryId, updates: { status } });
    },
    [updateMutation]
  );

  const handleTagsChange = useCallback(
    (entryId: string, tags: string[]) => {
      try {
        updateMutation.mutate({
          id: entryId,
          updates: {
            tags: tags.length > 0 ? tags : [],
          },
        });
        setIsEditingTags(null);
      } catch (error) {
        console.error('Error updating tags:', error);
      }
    },
    [updateMutation]
  );

  const handleViewStyleChange = useCallback(
    (newViewStyle: 'grid' | 'list') => {
      setViewStyle(newViewStyle);
      preferenceMutation.mutate(newViewStyle);
    },
    [preferenceMutation]
  );

  const handleEditTags = useCallback((entryId: string | null) => {
    setIsEditingTags(entryId);
  }, []);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // Memoized computations
  const allTags = useMemo(() => extractAllTags(entries), [entries]);

  const filteredEntries = useMemo(
    () => filterEntries(entries, debouncedSearchQuery, selectedTags),
    [entries, debouncedSearchQuery, selectedTags]
  );

  // Virtual scrolling logic for large lists
  const shouldVirtualize = filteredEntries.length > VIRTUALIZATION_THRESHOLD;
  const virtualization = useSimpleVirtualization(
    filteredEntries,
    VIRTUAL_ITEM_HEIGHT,
    VIRTUAL_CONTAINER_HEIGHT,
    scrollTop
  );

  // Memoized render function for items
  const renderWatchlistItem = useCallback(
    (entry: WatchlistEntry, virtualProps?: { style: React.CSSProperties }) => {
      const props: WatchlistItemProps = {
        entry,
        viewStyle,
        isEditingTags,
        onStatusChange: handleStatusChange,
        onTagsChange: handleTagsChange,
        onEditTags: handleEditTags,
      };

      if (virtualProps?.style) {
        props.style = virtualProps.style;
      }

      return <WatchlistItem key={entry.entry_id} {...props} />;
    },
    [
      viewStyle,
      isEditingTags,
      handleStatusChange,
      handleTagsChange,
      handleEditTags,
    ]
  );

  if (isLoading) {
    return (
      <PageContainer maxWidth="xxl" padding="lg" centered>
        <Container fluid centered>
          <Typography>Loading your watchlist...</Typography>
        </Container>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer maxWidth="xxl" padding="lg" centered>
        <Container fluid centered>
          <Typography color="error">
            Error loading watchlist:{' '}
            {error instanceof Error ? error.message : 'Unknown error'}
          </Typography>
        </Container>
      </PageContainer>
    );
  }

  const renderContent = () => {
    if (shouldVirtualize && viewStyle === 'list') {
      // Use virtualization for large lists in list view
      return (
        <VirtualizedContainer
          height={VIRTUAL_CONTAINER_HEIGHT}
          onScroll={handleScroll}
        >
          <VirtualizedContent height={virtualization.totalHeight}>
            {virtualization.visibleItems.map(({ item, top }) => {
              if (!item) return null;
              return renderWatchlistItem(item, {
                style: {
                  position: 'absolute',
                  top,
                  left: 0,
                  right: 0,
                  height: VIRTUAL_ITEM_HEIGHT,
                },
              });
            })}
          </VirtualizedContent>
        </VirtualizedContainer>
      );
    }

    // Regular rendering for smaller lists or grid view
    return viewStyle === 'grid' ? (
      <GridContainer>
        {filteredEntries.map(entry => renderWatchlistItem(entry))}
      </GridContainer>
    ) : (
      <ListContainer>
        {filteredEntries.map(entry => renderWatchlistItem(entry))}
      </ListContainer>
    );
  };

  return (
    <PageContainer maxWidth="xxl" padding="lg" centered>
      <Container fluid centered>
        <H1 gutterBottom>My Watchlist</H1>

        <Card accentColor="#69c176">
          <CardContent>
            <Flex gap="md" wrap="wrap" style={{ marginBottom: '1rem' }}>
              <TabButton
                $active={activeTab === 'list'}
                onClick={() => setActiveTab('list')}
              >
                My List ({entries.length})
                {shouldVirtualize && (
                  <Typography variant="caption"> • Optimized View</Typography>
                )}
              </TabButton>
              <TabButton
                $active={activeTab === 'search'}
                onClick={() => setActiveTab('search')}
              >
                Add Content
              </TabButton>
            </Flex>

            {activeTab === 'list' && (
              <>
                <InputGroup>
                  <Flex gap="md" alignItems="center">
                    <Input
                      type="text"
                      placeholder="Search your watchlist..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      isFullWidth
                    />
                    <Select
                      value={viewStyle}
                      onChange={e =>
                        handleViewStyleChange(e.target.value as 'grid' | 'list')
                      }
                    >
                      <option value="grid">Grid View</option>
                      <option value="list">
                        List View{shouldVirtualize ? ' (Optimized)' : ''}
                      </option>
                    </Select>
                  </Flex>
                </InputGroup>

                {/* Tag filter when we have tags */}
                {allTags.length > 0 && (
                  <TagFilter
                    tags={allTags}
                    selectedTags={selectedTags}
                    onChange={setSelectedTags}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {activeTab === 'list' ? (
          <>
            {renderContent()}

            {filteredEntries.length === 0 &&
              (debouncedSearchQuery || selectedTags.length > 0) && (
                <Typography>
                  No content found
                  {debouncedSearchQuery ? ` for "${debouncedSearchQuery}"` : ''}
                  {selectedTags.length > 0 ? ` with selected tags` : ''}
                </Typography>
              )}
            {filteredEntries.length === 0 &&
              !debouncedSearchQuery &&
              selectedTags.length === 0 && (
                <Typography>
                  Your watchlist is empty. Add some titles to get started!
                </Typography>
              )}
          </>
        ) : (
          <SearchMedia />
        )}
      </Container>
    </PageContainer>
  );
};

export default React.memo(WatchlistPage);
