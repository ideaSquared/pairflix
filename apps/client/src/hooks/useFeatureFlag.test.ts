import { renderHook } from '../tests/setup';
import { useFeatureFlag } from './useFeatureFlag';

const mockUseSettings = vi.fn();

vi.mock('../contexts/SettingsContext', () => ({
  useSettings: () => mockUseSettings(),
}));

describe('useFeatureFlag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the default value while settings are loading', () => {
    mockUseSettings.mockReturnValue({
      settings: null,
      isLoading: true,
      error: null,
      refreshSettings: vi.fn(),
    });

    expect(
      renderHook(() => useFeatureFlag('enableMatching', true)).result.current
    ).toBe(true);
    expect(
      renderHook(() => useFeatureFlag('enableMatching')).result.current
    ).toBe(false);
  });

  it('returns the default value when settings are unavailable', () => {
    mockUseSettings.mockReturnValue({
      settings: null,
      isLoading: false,
      error: null,
      refreshSettings: vi.fn(),
    });

    const { result } = renderHook(() => useFeatureFlag('enableMatching', true));

    expect(result.current).toBe(true);
  });

  it('returns the resolved flag value once settings have loaded', () => {
    mockUseSettings.mockReturnValue({
      settings: { features: { enableMatching: true } },
      isLoading: false,
      error: null,
      refreshSettings: vi.fn(),
    });

    const { result } = renderHook(() => useFeatureFlag('enableMatching'));

    expect(result.current).toBe(true);
  });

  it('lets the resolved flag value override a truthy default', () => {
    mockUseSettings.mockReturnValue({
      settings: { features: { enableMatching: false } },
      isLoading: false,
      error: null,
      refreshSettings: vi.fn(),
    });

    const { result } = renderHook(() => useFeatureFlag('enableMatching', true));

    expect(result.current).toBe(false);
  });

  it('returns the default value when the flag is absent from settings', () => {
    mockUseSettings.mockReturnValue({
      settings: { features: {} },
      isLoading: false,
      error: null,
      refreshSettings: vi.fn(),
    });

    const { result } = renderHook(() =>
      useFeatureFlag('enableUserProfiles', true)
    );

    expect(result.current).toBe(true);
  });
});
