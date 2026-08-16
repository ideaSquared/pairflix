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
import { search, type SearchResult, watchlist } from '../../services/api';
import * as styles from './SearchMedia.css';

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

const PosterImage = ({
  $isListView,
  className,
  ...rest
}: {
  $isListView?: boolean;
  src?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <LazyImage
    className={`${styles.posterImage({ isListView: $isListView })}${className ? ` ${className}` : ''}`}
    {...rest}
  />
);

const GridContainer = ({ children }: { children: React.ReactNode }) => (
  <CardGrid className={styles.gridContainer}>{children}</CardGrid>
);

const ListContainer = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.listContainer}>{children}</div>
);

// Optimized search controls

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
    const releaseDate = result.release_date || result.first_air_date;
    const releaseYear = releaseDate
      ? new Date(releaseDate).getFullYear()
      : null;

    const content = useMemo(
      () => (
        <>
          <PosterImage
            src={posterUrl || ''}
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
            {result.overview && (
              <Typography variant="body2" className={styles.overview}>
                {result.overview}
              </Typography>
            )}
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
      <Card variant="primary" className={styles.enhancedListViewItem}>
        <CardContent>{content}</CardContent>
      </Card>
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
  } = useQuery({
    queryKey: ['search', debouncedSearchQuery],
    queryFn: () => search.media(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length >= 2,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Optimized add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: (item: SearchResult) =>
      watchlist.add({
        tmdb_id: item.id,
        media_type: item.media_type,
        status: 'to_watch',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

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
          No results found for &quot;{debouncedSearchQuery}&quot;. Try a
          different search term.
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
            isAdding={addToWatchlistMutation.isPending}
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
    addToWatchlistMutation.isPending,
  ]);

  return (
    <>
      <div className={styles.searchControls}>
        <InputGroup style={{ flex: 1 }}>
          <Input
            type="text"
            placeholder="Search for movies and TV shows..."
            value={searchQuery}
            onChange={handleSearchChange}
            isFullWidth
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
      </div>

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
