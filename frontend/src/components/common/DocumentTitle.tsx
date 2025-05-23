import { useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

interface DocumentTitleProps {
	title?: string; // Optional specific page title
}

/**
 * Component that updates the document title based on application settings.
 * Can accept a specific page title to append to the site name.
 */
const DocumentTitle: React.FC<DocumentTitleProps> = ({ title }) => {
	const { settings } = useSettings();

	useEffect(() => {
		const siteName = settings?.general.siteName || 'PairFlix';

		if (title) {
			// If a specific page title is provided, format as "Page Title | Site Name"
			document.title = `${title} | ${siteName}`;
		} else {
			// Otherwise just use the site name
			document.title = siteName;
		}

		// Restore original title on unmount
		return () => {
			document.title = 'PairFlix';
		};
	}, [settings?.general.siteName, title]);

	// This component doesn't render anything
	return null;
};

export default DocumentTitle;
