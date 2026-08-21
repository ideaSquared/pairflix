import { renderHook } from '../../tests/setup';
import { useAffiliateParams } from './useAffiliateParams';

// In the Vitest runtime NODE_ENV is 'test', so useAffiliateParams reads the raw value from
// process.env (which vi.stubEnv populates); a real browser build reads the same var from the
// Vite-injected import.meta.env literal (see useAffiliateParams.ts).
describe('useAffiliateParams', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('parses a JSON object of affiliate params, keeping only string values', () => {
    vi.stubEnv(
      'VITE_AFFILIATE_PARAMS',
      JSON.stringify({ ref: 'abc', campaign: 'summer', count: 3, nested: {} })
    );

    const { result } = renderHook(() => useAffiliateParams());

    expect(result.current).toEqual({ ref: 'abc', campaign: 'summer' });
  });

  it('falls back to an empty object on malformed JSON', () => {
    vi.stubEnv('VITE_AFFILIATE_PARAMS', '{ not valid json');

    const { result } = renderHook(() => useAffiliateParams());

    expect(result.current).toEqual({});
  });

  it('falls back to an empty object when the JSON is not a plain object', () => {
    vi.stubEnv('VITE_AFFILIATE_PARAMS', JSON.stringify(['a', 'b']));

    const { result } = renderHook(() => useAffiliateParams());

    expect(result.current).toEqual({});
  });

  it('falls back to an empty object when the env var is absent', () => {
    const { result } = renderHook(() => useAffiliateParams());

    expect(result.current).toEqual({});
  });
});
