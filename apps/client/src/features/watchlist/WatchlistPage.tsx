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
import { useAuth } from '../../hooks/useAuth';
import {
  user as userService,
  watchlist,
  type WatchlistEntry,
} from '../../services/api';
import SearchMedia from './SearchMedia';
import * as styles from './WatchlistPage.css';

const WatchlistCard = ({
  status,
  className,
  ...rest
}: { status: WatchlistEntry['status'] } & React.ComponentProps<
  typeof Card
>) => (
  <Card
    className={`${styles.watchlistCard({ status })}${className ? ` ${className}` : ''}`}
    {...rest}
  />
);

const TabButton = ({
  active,
  className,
  ...rest
}: { active: boolean } & React.ComponentProps<typeof Button>) => (
  <Button
    className={`${styles.tabButton({ active })}${className ? ` ${className}` : ''}`}
    {...rest}
  />
);

const RelativeCard = ({
  className,
  ...rest
}: React.ComponentProps<typeof CardContent>) => (
  <CardContent
    className={`${styles.relativeCard}${className ? ` ${className}` : ''}`}
    {...rest}
  />
);

const GridContainer = ({ children }: { children: React.ReactNode }) => (
  <CardGrid className={styles.gridContainer}>{children}</CardGrid>
);

const ListContainer = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.listContainer}>{children}</div>
);

const ListViewItem = ({
  className,
  ...rest
}: { status: WatchlistEntry['status'] } & React.ComponentProps<
  typeof Card
>) => (
  <WatchlistCard
    className={`${styles.listViewItem}${className ? ` ${className}` : ''}`}
    {...rest}
  />
);

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className={styles.tag}>{children}</span>
);

type PreferenceResponse = {
  token: string;
  user: {
    preferences: {
      viewStyle: 'grid' | 'list';
      [key: string]: unknown;
    };
  };
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
const VirtualizedContainer = ({
  height,
  children,
  ...rest
}: { height: number; children: React.ReactNode } & Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'style' | 'children'
>) => (
  <div
    className={styles.virtualizedContainer}
    style={{ height: `${height}px` }}
    {...rest}
  >
    {children}
  </div>
);

const VirtualizedContent = ({
  height,
  children,
}: {
  height: number;
  children: React.ReactNode;
}) => (
  <div className={styles.virtualizedContent} style={{ height: `${height}px` }}>
    {children}
  </div>
);

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
          <div className={styles.tagsSection}>
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
                <div className={styles.tagsContainer}>
                  {entry.tags && entry.tags.length > 0 ? (
                    entry.tags.map((tag, idx) => <Tag key={idx}>{tag}</Tag>)
                  ) : (
                    <Typography variant="caption">No tags added</Typography>
                  )}
                </div>
              </>
            )}
          </div>
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
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<WatchlistEntry>;
    }) => watchlist.update(id, updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

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
  } = useQuery({
    queryKey: ['watchlist'],
    queryFn: watchlist.getAll,
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
                active={activeTab === 'list'}
                onClick={() => setActiveTab('list')}
              >
                My List ({entries.length})
                {shouldVirtualize && (
                  <Typography variant="caption"> • Optimized View</Typography>
                )}
              </TabButton>
              <TabButton
                active={activeTab === 'search'}
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
                  No matches found
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
