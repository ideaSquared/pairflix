/// <reference types="vite/client" />

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

// Environment variable handling that works in browser, Vite, and Jest environments
declare const process:
  | {
      env: {
        NODE_ENV?: string;
        VITE_API_URL?: string;
      };
    }
  | undefined;

// Safe function to access Vite environment variables
const getViteEnvVar = (key: string): string | undefined => {
  // In Jest environment, we don't have import.meta, so return undefined
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return undefined;
  }

  // Check if we're in a browser environment with Vite
  // Use a try-catch to safely access import.meta without causing Jest parse errors
  try {
    // This will be replaced by Vite at build time with actual values
    // Jest won't execute this since it returns early in test environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const importMeta = (globalThis as any).import?.meta;
    return importMeta?.env?.[key];
  } catch {
    return undefined;
  }
};

// Empty by default -- '/api/...' then resolves relative to the current origin, which the Vite
// dev server proxies to the Worker (see vite.config.ts) and which a production same-site domain
// setup would route directly. Cross-origin (SameSite=Lax cookies) only works if VITE_API_URL is
// explicitly set to a same-site Worker URL.
const getApiUrl = (): string => {
  if (
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV === 'test'
  ) {
    return process.env.VITE_API_URL || '';
  }

  return getViteEnvVar('VITE_API_URL') || '';
};

export const BASE_URL = getApiUrl();

// Common interfaces used across multiple services
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
  favoriteGenres: string[];
}

export interface PaginatedResponse<T> {
  logs: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Seeds the `csrfToken` cookie and returns its value to echo back as the `x-csrf-token` header --
 * fetched fresh before every mutating call (matching the Hono API's own e2e test helper, and its
 * `csrfMiddleware`'s doc comment, which describes exactly this pattern) rather than cached, so
 * there's no staleness/invalidation logic to get wrong. */
const fetchCsrfToken = async (): Promise<string> => {
  const response = await fetch(`${BASE_URL}/api/auth/csrf-token`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch CSRF token: ${response.status} ${response.statusText}`
    );
  }
  const data = (await response.json()) as { csrfToken: string };
  return data.csrfToken;
};

// Common fetch utility -- auth is cookie-based (see CLAUDE.md's "Auth & API" section): the
// browser sends the session cookie automatically, there's no token to attach, and mutating
// requests carry a double-submit CSRF header.
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...Object.fromEntries(Object.entries(options.headers || {})),
  });

  if (MUTATING_METHODS.has(method)) {
    headers.set('x-csrf-token', await fetchCsrfToken());
  }

  try {
    const fullUrl = url.startsWith('/api') ? `${BASE_URL}${url}` : url;
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(
          error.error ||
            error.message ||
            `Request failed with status ${response.status}`
        );
      } catch {
        // If we can't parse the error as JSON, use status text
        throw new Error(
          `Request failed with status ${response.status} ${response.statusText}`
        );
      }
    }

    if (response.status === 204) {
      return undefined;
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred', { cause: error });
  }
};
