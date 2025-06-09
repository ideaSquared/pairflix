/// <reference types="vite/client" />

// Constants for consistent token storage
export const ADMIN_TOKEN_KEY = 'admin_token';

/**
 * Handle API errors in a consistent way
 */
export const handleApiError = (
  error: unknown,
  defaultMessage: string
): Error => {
  // For fetch errors
  if (error instanceof Response) {
    return new Error(`${defaultMessage}: ${error.status} ${error.statusText}`);
  }

  // For standard errors
  if (error instanceof Error) {
    return new Error(`${defaultMessage}: ${error.message}`);
  }

  // For JSON error responses that were already parsed
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as { message?: string; error?: string };
    if (errorObj.message || errorObj.error) {
      return new Error(errorObj.message || errorObj.error || defaultMessage);
    }
  }

  // Fallback for unknown error types
  return new Error(defaultMessage);
};

// Environment variable handling that works in both browser and test environments
declare const process:
  | {
      env: {
        NODE_ENV?: string;
        VITE_API_URL?: string;
      };
    }
  | undefined;

const getApiUrl = () => {
  // Check if we're in a test environment
  if (
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV === 'test'
  ) {
    return process.env.VITE_API_URL || 'http://localhost:3000';
  }

  // Default for browser environment - will be replaced by Vite at build time
  return 'http://localhost:3000';
};

export const BASE_URL = getApiUrl();

// Common interfaces used across multiple services
export interface WatchlistEntry {
  entry_id: string;
  user_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  status: WatchlistEntryStatus;
  rating?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  tmdb_status?: string;
  title?: string;
  overview?: string;
  poster_path?: string;
}

export type WatchlistEntryStatus =
  | 'to_watch'
  | 'watch_together_focused'
  | 'watch_together_background'
  | 'watching'
  | 'finished'
  | 'flagged'
  | 'removed'
  | 'active';

export interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv';
  poster_path: string | null;
  overview: string;
}

export interface SearchResponse {
  page: number;
  results: SearchResult[];
  total_pages: number;
  total_results: number;
}

export interface Match {
  match_id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
  updated_at: Date;
  user1?: { email: string };
  user2?: { email: string };
}

export interface ContentMatch {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path?: string;
  overview?: string;
  user1_status: WatchlistEntry['status'];
  user2_status: WatchlistEntry['status'];
}

export interface User {
  id: string;
  username: string;
  email: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  viewStyle: 'grid' | 'list';
  emailNotifications: boolean;
  autoArchiveDays: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Common fetch utility function with authentication
export const fetchWithAuth = async function <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...Object.fromEntries(Object.entries(options.headers || {})),
  });
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const fullUrl = url.startsWith('/api') ? `${BASE_URL}${url}` : url;
    const response = await fetch(fullUrl, { ...options, headers });

    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(
          error.error ||
            error.message ||
            `Request failed with status ${response.status}`
        );
      } catch {
        throw new Error(
          `Request failed with status ${response.status} ${response.statusText}`
        );
      }
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};
