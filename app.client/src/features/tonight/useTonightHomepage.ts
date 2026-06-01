import { useAuth } from '../../hooks/useAuth';

interface PreferencesWithTonight {
  tonightAsHomepage?: boolean;
  selectedProviders?: string[];
}

// Tonight is the new default landing for authenticated users.
// Pref lives in the existing User.preferences JSONB once Phase A wires it.
export function useTonightHomepagePreference(): {
  tonightAsHomepage: boolean;
  selectedProviders: string[];
} {
  const { user } = useAuth();
  const prefs = (user?.preferences as PreferencesWithTonight | undefined) ?? {};
  return {
    tonightAsHomepage: prefs.tonightAsHomepage ?? true,
    selectedProviders: prefs.selectedProviders ?? [
      'netflix',
      'prime',
      'disney_plus',
    ],
  };
}
