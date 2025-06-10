import { useEffect } from 'react';

export interface DocumentTitleProps {
  title?: string; // Optional specific page title
  siteName?: string; // Application-specific site name
  defaultSiteName?: string; // Fallback site name
}

/**
 * Component that updates the document title.
 * Can accept a specific page title to append to the site name.
 * Designed to be app-agnostic by accepting site name as props.
 */
const DocumentTitle: React.FC<DocumentTitleProps> = ({
  title,
  siteName,
  defaultSiteName = 'PairFlix',
}) => {
  useEffect(() => {
    const appSiteName = siteName || defaultSiteName;

    if (title) {
      // If a specific page title is provided, format as "Page Title | Site Name"
      document.title = `${title} | ${appSiteName}`;
    } else {
      // Otherwise just use the site name
      document.title = appSiteName;
    }

    // Restore original title on unmount
    return () => {
      document.title = defaultSiteName;
    };
  }, [siteName, title, defaultSiteName]);

  // This component doesn't render anything
  return null;
};

export default DocumentTitle;
