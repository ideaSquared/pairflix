import { renderHook } from '../../tests/setup';
import { useTonightHomepagePreference } from './useTonightHomepage';

type AuthState = {
  user: { preferences?: { selectedProviders?: string[] } } | null;
};

const mockUseAuth = vi.fn<() => AuthState>();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const DEFAULT_PROVIDERS = ['netflix', 'prime', 'disney_plus'];

describe('useTonightHomepagePreference', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the stored selectedProviders when the user has a preference', () => {
    mockUseAuth.mockReturnValue({
      user: { preferences: { selectedProviders: ['hbo', 'hulu'] } },
    });

    const { result } = renderHook(() => useTonightHomepagePreference());

    expect(result.current.selectedProviders).toEqual(['hbo', 'hulu']);
  });

  it('defaults selectedProviders when the user has no stored preference', () => {
    mockUseAuth.mockReturnValue({ user: { preferences: {} } });

    const { result } = renderHook(() => useTonightHomepagePreference());

    expect(result.current.selectedProviders).toEqual(DEFAULT_PROVIDERS);
  });

  it('defaults selectedProviders when there is no authenticated user', () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useTonightHomepagePreference());

    expect(result.current.selectedProviders).toEqual(DEFAULT_PROVIDERS);
  });
});
