import {
  isInternalPath,
  nextQueryString,
  resolveNextPath,
} from './internalPath';

describe('isInternalPath', () => {
  it('accepts a same-origin path', () => {
    expect(isInternalPath('/household-invites/abc123')).toBe(true);
  });

  it('rejects a protocol-relative URL', () => {
    expect(isInternalPath('//evil.example')).toBe(false);
  });

  it('rejects an absolute URL', () => {
    expect(isInternalPath('https://evil.example')).toBe(false);
  });

  it('rejects a path that does not start with a slash', () => {
    expect(isInternalPath('evil.example')).toBe(false);
  });
});

describe('resolveNextPath', () => {
  it('returns the raw value when it is a valid internal path', () => {
    expect(resolveNextPath('/tonight', '/login')).toBe('/tonight');
  });

  it('falls back when null', () => {
    expect(resolveNextPath(null, '/login')).toBe('/login');
  });

  it('falls back when the value is an off-site URL', () => {
    expect(resolveNextPath('https://evil.example', '/login')).toBe('/login');
  });
});

describe('nextQueryString', () => {
  it('builds an encoded next param for a valid internal path', () => {
    expect(nextQueryString('/household-invites/abc123')).toBe(
      '?next=%2Fhousehold-invites%2Fabc123'
    );
  });

  it('is empty for null', () => {
    expect(nextQueryString(null)).toBe('');
  });

  it('is empty for an off-site URL', () => {
    expect(nextQueryString('https://evil.example')).toBe('');
  });
});
