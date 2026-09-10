/// <reference types="vite/client" />

/** Thrown by fetchWithAuth for a non-2xx response -- carries the HTTP status so callers (e.g. the
 * query client's retry policy) can tell a client error (4xx, won't succeed on retry) from a
 * transient server/network one. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

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

// Environment variable handling that works in browser, Vite, and Vitest environments
declare const process:
  | {
      env: {
        NODE_ENV?: string;
        VITE_API_URL?: string;
      };
    }
  | undefined;

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

  // Replaced by Vite at build time with the actual value.
  return import.meta.env.VITE_API_URL || '';
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
  selectedProviders?: string[];
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

// The API returns short machine codes (see services/api/src/routes/households.ts and
// middleware/entitlements.ts) for known failure conditions -- map the ones the client actually
// surfaces to a human sentence rather than showing the raw code.
const KNOWN_ERROR_MESSAGES: Record<string, string> = {
  pick_quota_exceeded:
    "You've used today's free picks for this household. Upgrade for unlimited picks.",
  provider_not_available:
    'That title is not available to launch on this provider right now.',
  household_not_found: "We couldn't find that household.",
  household_id_required:
    'Something went wrong loading this household. Please try again.',
  not_a_household_member: 'You are not a member of this household.',
  owner_only: 'Only the household owner can do that.',
  invite_invalid_or_expired: 'That invite is invalid or has expired.',
  billing_not_configured: 'Billing is not set up yet.',
  no_billing_account: 'This household does not have a billing account yet.',
  use_billing_portal: 'Manage your subscription from the billing portal.',
  'No candidates found for these inputs':
    "We couldn't find a match for that mood and time -- try widening your filters.",
};

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

// Distinguishes a raw error *code* (snake_case, e.g. "pick_quota_exceeded") from an already
// human-readable message (e.g. "Invalid email or password") so an unmapped code falls back to
// something readable instead of the raw code.
const looksLikeErrorCode = (message: string): boolean =>
  /^[a-z0-9]+(_[a-z0-9]+)+$/.test(message);

const describeError = (message: string): string => {
  const known = KNOWN_ERROR_MESSAGES[message];
  if (known) return known;
  return looksLikeErrorCode(message) ? GENERIC_ERROR_MESSAGE : message;
};

// fetchWithAuth dispatches this whenever the API rejects a request with "Authentication
// required" (an invalid or expired session) -- SessionExpiredHandler listens for it to clear the
// query cache and send the visitor to /login from one place, instead of every screen handling a
// 401 on its own.
export const SESSION_EXPIRED_EVENT = 'pairflix:session-expired';

const notifySessionExpired = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
};

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
      // A parse failure (non-JSON body) falls back to the generic message below --
      // .catch keeps it from being caught by this same function's outer try/catch.
      const parsed = await response.json().catch(() => null);
      const rawMessage =
        parsed?.error ||
        parsed?.message ||
        `Request failed with status ${response.status} ${response.statusText}`;
      if (response.status === 401 && rawMessage === 'Authentication required') {
        notifySessionExpired();
      }
      throw new ApiError(describeError(rawMessage), response.status);
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
