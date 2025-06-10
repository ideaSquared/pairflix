import {
  Badge,
  Button,
  Card,
  CardContent,
  CardGrid,
  ErrorText,
  H3,
  Input,
  InputGroup,
  Typography,
} from '@pairflix/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { search, SearchResult, watchlist } from '../../services/api';

// Performance hook for debouncing
const useDebounced = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Lazy loading image component for better performance
const LazyImage = React.memo<{
  src?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}>(({ src, alt, className, style }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  return (
    <div style={{ position: 'relative', ...style }} className={className}>
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">Loading...</Typography>
        </div>
      )}
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      ) : isLoaded && hasError ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">No Image</Typography>
        </div>
      ) : null}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

const PosterImage = styled(LazyImage)`
  width: 100%;
  max-width: ${({ $isListView }: { $isListView?: boolean }) =>
    $isListView ? '150px' : '100%'};
  height: ${({ $isListView }: { $isListView?: boolean }) =>
    $isListView ? '225px' : '300px'};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const Overview = styled(Typography).attrs({ variant: 'body2' })`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;

const ListViewItem = styled(Card).attrs({
  variant: 'primary',
})`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  > div {
    flex: 1;
    display: flex;
    gap: ${({ theme }) => theme.spacing.lg};

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .actions {
      display: flex;
      align-items: center;
      padding-left: ${({ theme }) => theme.spacing.md};
    }
  }
`;

const GridContainer = styled(CardGrid)`
  margin-top: ${({ theme }) => theme.spacing.lg};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  /* Responsive optimizations */
  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  @media (min-width: 1600px) {
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  }

  @media (min-width: 2000px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
`;

const ListContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const EnhancedListViewItem = styled(ListViewItem)`
  width: 100%;

  .content {
    flex: 3;
  }

  .actions {
    flex: 1;
    justify-content: flex-end;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    > div {
      flex-direction: column;

      .actions {
        padding-left: 0;
        padding-top: ${({ theme }) => theme.spacing.md};
      }
    }
  }
`;

// Optimized search controls
const SearchControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

// Memoized search result item component
interface SearchResultItemProps {
  result: SearchResult;
  viewStyle: 'grid' | 'list';
  onAddToWatchlist: (result: SearchResult) => void;
  isAdding: boolean;
}

const SearchResultItem = React.memo<SearchResultItemProps>(
  ({ result, viewStyle, onAddToWatchlist, isAdding }) => {
    const handleAddClick = useCallback(() => {
      onAddToWatchlist(result);
    }, [result, onAddToWatchlist]);

    const posterUrl = result.poster_path
      ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
      : undefined;

    // Safely get title and handle potential undefined values
    const title = result.title || result.name || 'Unknown Title';
    const releaseYear = result.release_date
      ? new Date(result.release_date).getFullYear()
      : null;

    const content = useMemo(
      () => (
        <>
          <PosterImage
            src={posterUrl}
            alt={title}
            $isListView={viewStyle === 'list'}
          />
          <div className="content">
            <H3 gutterBottom>
              <Badge variant="primary">
                {result.media_type === 'tv' ? 'TV Series' : 'Movie'}
              </Badge>{' '}
              {title}
            </H3>
            {releaseYear && (
              <Typography variant="body2" gutterBottom>
                {releaseYear}
              </Typography>
            )}
            {result.overview && <Overview>{result.overview}</Overview>}
          </div>
          <div className="actions">
            <Button
              onClick={handleAddClick}
              disabled={isAdding}
              variant="primary"
            >
              {isAdding ? 'Adding...' : 'Add to Watchlist'}
            </Button>
          </div>
        </>
      ),
      [
        posterUrl,
        title,
        result.media_type,
        releaseYear,
        result.overview,
        viewStyle,
        handleAddClick,
        isAdding,
      ]
    );

    return viewStyle === 'grid' ? (
      <Card variant="primary">
        <CardContent>{content}</CardContent>
      </Card>
    ) : (
      <EnhancedListViewItem>
        <CardContent>{content}</CardContent>
      </EnhancedListViewItem>
    );
  }
);

SearchResultItem.displayName = 'SearchResultItem';

const SearchMedia: React.FC = () => {
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');

  // Debounce search query for performance
  const debouncedSearchQuery = useDebounced(searchQuery, 500);

  // Memoized search query execution
  const {
    data: searchResults = [],
    isLoading: isSearching,
    error: searchError,
  } = useQuery(
    ['search', debouncedSearchQuery],
    () => search.media(debouncedSearchQuery),
    {
      enabled: debouncedSearchQuery.length >= 2,
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Optimized add to watchlist mutation
  const addToWatchlistMutation = useMutation(
    (item: SearchResult) =>
      watchlist.add({
        tmdb_id: item.id,
        media_type: item.media_type,
        overview: item.overview,
        poster_path: item.poster_path,
        status: 'to_watch',
      }),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries(['watchlist']);
      },
    }
  );

  // Memoized event handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleViewStyleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setViewStyle(e.target.value as 'grid' | 'list');
    },
    []
  );

  const handleAddToWatchlist = useCallback(
    (result: SearchResult) => {
      addToWatchlistMutation.mutate(result);
    },
    [addToWatchlistMutation]
  );

  // Memoized render functions
  const renderSearchResults = useCallback(() => {
    if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
      return (
        <Typography
          variant="body2"
          style={{ textAlign: 'center', marginTop: '2rem' }}
        >
          Enter at least 2 characters to search for movies and TV shows.
        </Typography>
      );
    }

    if (isSearching) {
      return (
        <Typography
          variant="body2"
          style={{ textAlign: 'center', marginTop: '2rem' }}
        >
          Searching...
        </Typography>
      );
    }

    if (searchError) {
      return (
        <ErrorText style={{ textAlign: 'center', marginTop: '2rem' }}>
          Error searching:{' '}
          {searchError instanceof Error ? searchError.message : 'Unknown error'}
        </ErrorText>
      );
    }

    if (searchResults.length === 0) {
      return (
        <Typography
          variant="body2"
          style={{ textAlign: 'center', marginTop: '2rem' }}
        >
          No results found for "{debouncedSearchQuery}". Try a different search
          term.
        </Typography>
      );
    }

    const Container = viewStyle === 'grid' ? GridContainer : ListContainer;

    return (
      <Container>
        {searchResults.map((result: SearchResult) => (
          <SearchResultItem
            key={`${result.media_type}-${result.id}`}
            result={result}
            viewStyle={viewStyle}
            onAddToWatchlist={handleAddToWatchlist}
            isAdding={addToWatchlistMutation.isLoading}
          />
        ))}
      </Container>
    );
  }, [
    debouncedSearchQuery,
    isSearching,
    searchError,
    searchResults,
    viewStyle,
    handleAddToWatchlist,
    addToWatchlistMutation.isLoading,
  ]);

  return (
    <>
      <SearchControls>
        <InputGroup style={{ flex: 1 }}>
          <Input
            type="text"
            placeholder="Search for movies and TV shows..."
            value={searchQuery}
            onChange={handleSearchChange}
            isFullWidth
            autoFocus
          />
        </InputGroup>

        <select
          value={viewStyle}
          onChange={handleViewStyleChange}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            minWidth: '120px',
          }}
        >
          <option value="grid">Grid View</option>
          <option value="list">List View</option>
        </select>
      </SearchControls>

      {/* Performance info for development */}
      {process.env.NODE_ENV === 'development' && searchResults.length > 0 && (
        <Typography
          variant="caption"
          style={{ marginBottom: '1rem', opacity: 0.7 }}
        >
          Found {searchResults.length} results • Images load lazily for better
          performance
        </Typography>
      )}

      {renderSearchResults()}

      {/* Success message for additions */}
      {addToWatchlistMutation.isSuccess && (
        <Typography
          variant="body2"
          style={{
            color: 'green',
            textAlign: 'center',
            marginTop: '1rem',
            padding: '0.5rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '4px',
          }}
        >
          Item added to your watchlist!
        </Typography>
      )}
    </>
  );
};

export default React.memo(SearchMedia);
