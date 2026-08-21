import { renderHook } from '../../tests/setup';
import { useAffiliateParams } from './useAffiliateParams';

// NOTE (source bug, not fixed): useAffiliateParams.ts reads the raw value via a dynamic
// `(globalThis as any).import?.meta?.env?.VITE_AFFILIATE_PARAMS` lookup. Vite only statically
// replaces the *literal* `import.meta.env.X` token, so `globalThis.import` is undefined in a real
// build and the env var is never read there -- the sibling flags.ts:12-15 documents this exact
// pitfall and reads `import.meta.env` directly instead. In tests the NODE_ENV === 'test' guard
// also forces undefined. The parse-path cases below therefore have to synthesize the
// `globalThis.import` shim (which no real runtime populates) purely to exercise the parse logic;
// the final case asserts the actual test-environment behaviour: always {}.
type ImportShim = { meta?: { env?: { VITE_AFFILIATE_PARAMS?: string } } };
const globalWithImport = globalThis as typeof globalThis & {
  import?: ImportShim;
};

const setRawEnv = (raw: string | undefined) => {
  vi.stubEnv('NODE_ENV', 'production');
  const env = raw === undefined ? {} : { VITE_AFFILIATE_PARAMS: raw };
  globalWithImport.import = { meta: { env } };
};

describe('useAffiliateParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete globalWithImport.import;
  });

  it('parses a JSON object of affiliate params, keeping only string values', () => {
    setRawEnv(
      JSON.stringify({ ref: 'abc', campaign: 'summer', count: 3, nested: {} })
    );

    const { result } = renderHook(() => useAffiliateParams());

    expect(result.current).toEqual({ ref: 'abc', campaign: 'summer' });
  });

  it('falls back to an empty object on malformed JSON', () => {
    setRawEnv('{ not valid json');

    const { result } = renderHook(() => useAffiliateParams());

    expect(result.current).toEqual({});
  });

  it('falls back to an empty object when the JSON is not a plain object', () => {
    setRawEnv(JSON.stringify(['a', 'b']));

    const { result } = renderHook(() => useAffiliateParams());

    expect(result.current).toEqual({});
  });

  it('falls back to an empty object when the env var is absent', () => {
    setRawEnv(undefined);

    const { result } = renderHook(() => useAffiliateParams());

    expect(result.current).toEqual({});
  });

  it('returns an empty object in the test environment even when a value is present', () => {
    globalWithImport.import = {
      meta: { env: { VITE_AFFILIATE_PARAMS: JSON.stringify({ ref: 'abc' }) } },
    };

    const { result } = renderHook(() => useAffiliateParams());

    expect(result.current).toEqual({});
  });
});
