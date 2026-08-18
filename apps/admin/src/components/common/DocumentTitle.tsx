import { DocumentTitle as SharedDocumentTitle } from '@pairflix/components';
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import type { SettingsTree } from '../../services/api';

// SettingsTree nests dot-path keys into objects, so this reads `general.siteName`
// off a value typed unknown -- see AdminSettings.tsx's readLlmRerank for the same pattern.
const readSiteName = (tree: SettingsTree | null): string | undefined => {
  const general = tree?.general;
  if (typeof general !== 'object' || general === null) return undefined;
  const siteName = (general as Record<string, unknown>).siteName;
  return typeof siteName === 'string' ? siteName : undefined;
};

interface DocumentTitleProps {
  title?: string; // Optional specific page title
}

/**
 * App-specific wrapper for the shared DocumentTitle component
 * Provides the necessary settings context
 */
const DocumentTitle: React.FC<DocumentTitleProps> = ({ title }) => {
  const { settings } = useSettings();
  const siteName = readSiteName(settings);

  return (
    <SharedDocumentTitle
      {...(title !== undefined && { title })}
      {...(siteName && { siteName })}
      defaultSiteName="PairFlix Admin"
    />
  );
};

export default DocumentTitle;
