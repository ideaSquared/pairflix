import React, { useState } from 'react';
import styled from 'styled-components';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { Card, CardContent } from '../../../components/common/Card';
import { Flex } from '../../../components/common/Layout';
import { H2, Typography } from '../../../components/common/Typography';
import { useSettings } from '../../../contexts/SettingsContext';
import { AppSettings } from '../../../services/api';

const Container = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ImportExportCard = styled(Card)`
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StyledInput = styled.input`
	display: none;
`;

const FileUploadLabel = styled.label`
	display: inline-block;
	cursor: pointer;
`;

const SettingsImportExport: React.FC = () => {
	const { settings, updateSettings } = useSettings();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleExport = () => {
		if (!settings) {
			setError('No settings available to export');
			return;
		}

		try {
			// Create a sanitized copy of settings (removing sensitive data if needed)
			const exportData = JSON.stringify(settings, null, 2);

			// Create a downloadable file
			const blob = new Blob([exportData], { type: 'application/json' });
			const url = URL.createObjectURL(blob);

			// Create a temporary link and trigger the download
			const a = document.createElement('a');
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			a.download = `pairflix-settings-${timestamp}.json`;
			a.href = url;
			a.click();

			// Clean up
			URL.revokeObjectURL(url);
			setSuccess('Settings exported successfully');
			setError(null);
		} catch (err) {
			setError(
				`Failed to export settings: ${err instanceof Error ? err.message : String(err)}`
			);
			setSuccess(null);
		}
	};

	const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
		setError(null);
		setSuccess(null);

		const files = event.target.files;
		if (!files || files.length === 0) {
			return;
		}

		const file = files[0];
		if (!file) {
			return;
		}

		const reader = new FileReader();

		reader.onload = async (e) => {
			try {
				const content = e.target?.result as string;
				const importedSettings = JSON.parse(content) as AppSettings;

				// Validate the imported settings format
				if (!validateSettingsFormat(importedSettings)) {
					setError('Invalid settings format');
					return;
				}

				// Apply the imported settings
				await updateSettings(importedSettings);
				setSuccess('Settings imported successfully');
			} catch (err) {
				setError(
					`Failed to import settings: ${err instanceof Error ? err.message : String(err)}`
				);
			}
		};

		reader.onerror = () => {
			setError('Failed to read the file');
		};

		reader.readAsText(file);

		// Reset the file input so the same file can be selected again
		event.target.value = '';
	};

	const validateSettingsFormat = (settings: any): settings is AppSettings => {
		// Perform basic structure validation
		return (
			settings &&
			typeof settings === 'object' &&
			'general' in settings &&
			'security' in settings &&
			'features' in settings
		);
	};

	return (
		<Container>
			<H2 gutterBottom>Settings Import & Export</H2>
			<Typography gutterBottom>
				Backup your current settings configuration or restore from a previous
				backup
			</Typography>

			{error && (
				<Alert variant='error' onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			{success && (
				<Alert variant='success' onClose={() => setSuccess(null)}>
					{success}
				</Alert>
			)}

			<ImportExportCard>
				<CardContent>
					<Flex justifyContent='space-between' alignItems='center'>
						<div>
							<Typography variant='h4'>Export Settings</Typography>
							<Typography variant='body2'>
								Download your current settings as a JSON file
							</Typography>
						</div>
						<Button onClick={handleExport} variant='secondary'>
							Export Settings
						</Button>
					</Flex>
				</CardContent>
			</ImportExportCard>

			<ImportExportCard>
				<CardContent>
					<Flex justifyContent='space-between' alignItems='center'>
						<div>
							<Typography variant='h4'>Import Settings</Typography>
							<Typography variant='body2'>
								Restore settings from a previously exported file
							</Typography>
						</div>
						<FileUploadLabel>
							<Button as='span' variant='secondary'>
								Import Settings
							</Button>
							<StyledInput type='file' accept='.json' onChange={handleImport} />
						</FileUploadLabel>
					</Flex>
				</CardContent>
			</ImportExportCard>

			<Typography variant='body2' color='secondary'>
				Note: Importing settings will override all existing application
				settings. Make sure to export your current settings as a backup before
				importing.
			</Typography>
		</Container>
	);
};

export default SettingsImportExport;
