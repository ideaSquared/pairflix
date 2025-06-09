/**
 * Utility function to show an alert for features that aren't implemented yet
 * @param feature The name of the unimplemented feature
 * @returns A function that shows an alert when called
 */
export const notImplemented = (feature: string): void => {
  alert(`This feature (${feature}) isn't available yet.`);
};

/**
 * Creates an onClick handler for unimplemented features
 * @param feature The name of the unimplemented feature
 * @returns A function that can be used as an onClick handler
 */
export const createNotImplementedHandler = (feature: string) => (): void => {
  notImplemented(feature);
};
