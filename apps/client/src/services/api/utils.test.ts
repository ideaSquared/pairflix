import type { Mock } from 'vitest';
import { BASE_URL, fetchWithAuth, handleApiError } from './utils';

const jsonResponse = (body: unknown, init?: ResponseInit): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

describe('handleApiError', () => {
  it('formats a Response into a status message', () => {
    const response = new Response(null, {
      status: 404,
      statusText: 'Not Found',
    });

    expect(handleApiError(response, 'Load failed').message).toBe(
      'Load failed: 404 Not Found'
    );
  });

  it('wraps a standard Error with the default message', () => {
    expect(handleApiError(new Error('boom'), 'Load failed').message).toBe(
      'Load failed: boom'
    );
  });

  it('uses the message field of a parsed error object', () => {
    expect(handleApiError({ message: 'Nope' }, 'Load failed').message).toBe(
      'Nope'
    );
  });

  it('uses the error field when no message field is present', () => {
    expect(handleApiError({ error: 'Denied' }, 'Load failed').message).toBe(
      'Denied'
    );
  });

  it('falls back to the default message for an object with neither field', () => {
    expect(handleApiError({ code: 500 }, 'Load failed').message).toBe(
      'Load failed'
    );
  });

  it('falls back to the default message for a string', () => {
    expect(handleApiError('some string', 'Load failed').message).toBe(
      'Load failed'
    );
  });

  it('falls back to the default message for null', () => {
    expect(handleApiError(null, 'Load failed').message).toBe('Load failed');
  });
});

describe('fetchWithAuth', () => {
  let mockFetch: Mock<
    (url: string, options?: RequestInit) => Promise<Response>
  >;

  const headersOfCall = (index: number): Headers => {
    const call = mockFetch.mock.calls[index];
    const headers = call?.[1]?.headers;
    if (!(headers instanceof Headers)) {
      throw new Error(`expected a Headers instance on fetch call ${index}`);
    }
    return headers;
  };

  beforeEach(() => {
    mockFetch =
      vi.fn<(url: string, options?: RequestInit) => Promise<Response>>();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('issues a GET without a CSRF token and returns the parsed body', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ hello: 'world' }));

    const result = await fetchWithAuth('/api/thing');

    expect(result).toEqual({ hello: 'world' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/thing`,
      expect.objectContaining({ credentials: 'include' })
    );
    const headers = headersOfCall(0);
    expect(headers.has('x-csrf-token')).toBe(false);
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'] as const)(
    'fetches a CSRF token and attaches the x-csrf-token header for %s',
    async method => {
      mockFetch.mockImplementation((url: string) =>
        url.endsWith('/api/auth/csrf-token')
          ? Promise.resolve(jsonResponse({ csrfToken: 'tok-123' }))
          : Promise.resolve(jsonResponse({ ok: true }))
      );

      const result = await fetchWithAuth('/api/thing', { method });

      expect(result).toEqual({ ok: true });
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        `${BASE_URL}/api/auth/csrf-token`,
        { credentials: 'include' }
      );
      expect(headersOfCall(1).get('x-csrf-token')).toBe('tok-123');
    }
  );

  it('uppercases the method so a lowercase verb still triggers CSRF', async () => {
    mockFetch.mockImplementation((url: string) =>
      url.endsWith('/api/auth/csrf-token')
        ? Promise.resolve(jsonResponse({ csrfToken: 'tok-xyz' }))
        : Promise.resolve(jsonResponse({ ok: true }))
    );

    await fetchWithAuth('/api/thing', { method: 'post' });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(headersOfCall(1).get('x-csrf-token')).toBe('tok-xyz');
  });

  it('does not prepend BASE_URL to a URL that is not an /api path', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));

    await fetchWithAuth('https://external.test/data');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://external.test/data',
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('throws with the error field from a JSON error body', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        { error: 'Bad thing' },
        { status: 400, statusText: 'Bad Request' }
      )
    );

    await expect(fetchWithAuth('/api/thing')).rejects.toThrow('Bad thing');
  });

  it('throws with the message field when the error body has no error field', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        { message: 'Something went wrong' },
        { status: 500, statusText: 'Internal Server Error' }
      )
    );

    await expect(fetchWithAuth('/api/thing')).rejects.toThrow(
      'Something went wrong'
    );
  });

  it('throws a generic status message when the error body is not JSON', async () => {
    mockFetch.mockResolvedValue(
      new Response('not json', {
        status: 503,
        statusText: 'Service Unavailable',
      })
    );

    await expect(fetchWithAuth('/api/thing')).rejects.toThrow(
      'Request failed with status 503 Service Unavailable'
    );
  });

  it('returns undefined for a 204 No Content response', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(fetchWithAuth('/api/thing')).resolves.toBeUndefined();
  });

  it('surfaces a CSRF token fetch failure', async () => {
    mockFetch.mockResolvedValue(
      new Response('', { status: 500, statusText: 'Internal Server Error' })
    );

    await expect(
      fetchWithAuth('/api/thing', { method: 'POST' })
    ).rejects.toThrow('Failed to fetch CSRF token: 500 Internal Server Error');
  });

  it('wraps a non-Error rejection as a generic network error', async () => {
    mockFetch.mockRejectedValue('boom-string');

    await expect(fetchWithAuth('/api/thing')).rejects.toThrow(
      'Network error occurred'
    );
  });
});
