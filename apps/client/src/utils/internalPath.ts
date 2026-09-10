// A `next` redirect destination comes from a URL query param -- reject anything that isn't a
// same-origin path (an absolute or protocol-relative URL would bounce the browser off-site, and
// an absolute one would throw a SecurityError out of history.pushState anyway).
export const isInternalPath = (path: string): boolean =>
  path.startsWith('/') && !path.startsWith('//');

export const resolveNextPath = (
  rawNext: string | null,
  fallback: string
): string => (rawNext && isInternalPath(rawNext) ? rawNext : fallback);

// Builds a `?next=...` query string to append to /login or /register, forwarding an already
// validated `next` value -- empty string when there's nothing to forward.
export const nextQueryString = (rawNext: string | null): string =>
  rawNext && isInternalPath(rawNext)
    ? `?next=${encodeURIComponent(rawNext)}`
    : '';
