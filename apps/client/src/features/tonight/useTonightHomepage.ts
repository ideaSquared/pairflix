import { useAuth } from '../../hooks/useAuth';

interface PreferencesWithTonight {
  selectedProviders?: string[];
}

export function useTonightHomepagePreference(): {
  selectedProviders: string[];
} {
  const { user } = useAuth();
  const prefs = (user?.preferences as PreferencesWithTonight | undefined) ?? {};
  return {
    selectedProviders: prefs.selectedProviders ?? [
      'netflix',
      'prime',
      'disney_plus',
    ],
  };
}
