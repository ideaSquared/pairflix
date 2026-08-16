import { DocumentTitle as SharedDocumentTitle } from '@pairflix/components';
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';

interface DocumentTitleProps {
  title?: string; // Optional specific page title
}

/**
 * App-specific wrapper for the shared DocumentTitle component
 * Provides the necessary settings context
 */
const DocumentTitle: React.FC<DocumentTitleProps> = ({ title }) => {
  const { settings } = useSettings();

  return (
    <SharedDocumentTitle
      {...(title !== undefined && { title })}
      {...(settings?.general.siteName && {
        siteName: settings.general.siteName,
      })}
      defaultSiteName="PairFlix Admin"
    />
  );
};

export default DocumentTitle;
