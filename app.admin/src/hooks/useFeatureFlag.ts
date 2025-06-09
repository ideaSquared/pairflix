import { useSettings } from '../contexts/SettingsContext';

/**
 * Hook to check if a specific feature flag is enabled
 *
 * @param featureKey - The name of the feature to check in settings.features
 * @param defaultValue - Default value if settings haven't loaded yet
 * @returns boolean indicating if feature is enabled
 */
export function useFeatureFlag(
  featureKey: keyof Required<
    NonNullable<ReturnType<typeof useSettings>['settings']>
  >['features'],
  defaultValue = false
): boolean {
  const { settings, isLoading } = useSettings();

  // While loading, return the default value
  if (isLoading || !settings) {
    return defaultValue;
  }

  // Check if the feature exists in the settings
  if (featureKey in settings.features) {
    return Boolean(settings.features[featureKey]);
  }

  // If feature isn't defined in settings, return the default value
  return defaultValue;
}
