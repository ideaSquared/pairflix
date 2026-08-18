import { useAuth } from '../../hooks/useAuth';

export function useTonightHomepagePreference(): {
  selectedProviders: string[];
} {
  const { user } = useAuth();
  const prefs = user?.preferences;
  return {
    selectedProviders: prefs?.selectedProviders ?? [
      'netflix',
      'prime',
      'disney_plus',
    ],
  };
}
