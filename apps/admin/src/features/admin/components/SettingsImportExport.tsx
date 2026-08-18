import {
  Alert,
  Button,
  Card,
  CardContent,
  Flex,
  H2,
  Typography,
} from '@pairflix/components';
import React, { useState } from 'react';
import { useSettings } from '../../../contexts/SettingsContext';
import type { SettingsTree } from '../../../services/api';
import * as styles from './SettingsImportExport.css';

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

    reader.onload = async e => {
      try {
        const content = e.target?.result as string;
        const importedSettings = JSON.parse(content);

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

  // SettingsTree has no fixed set of keys (see its definition), so the only
  // thing worth validating on import is that it's a plain JSON object.
  const validateSettingsFormat = (
    settings: unknown
  ): settings is SettingsTree =>
    typeof settings === 'object' &&
    settings !== null &&
    !Array.isArray(settings);

  return (
    <div className={styles.container}>
      <H2 gutterBottom>Settings Import & Export</H2>
      <Typography gutterBottom>
        Backup your current settings configuration or restore from a previous
        backup
      </Typography>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card className={styles.importExportCard}>
        <CardContent>
          <Flex justifyContent="space-between" alignItems="center">
            <div>
              <Typography variant="h4">Export Settings</Typography>
              <Typography variant="body2">
                Download your current settings as a JSON file
              </Typography>
            </div>
            <Button onClick={handleExport} variant="secondary">
              Export Settings
            </Button>
          </Flex>
        </CardContent>
      </Card>

      <Card className={styles.importExportCard}>
        <CardContent>
          <Flex justifyContent="space-between" alignItems="center">
            <div>
              <Typography variant="h4">Import Settings</Typography>
              <Typography variant="body2">
                Restore settings from a previously exported file
              </Typography>
            </div>
            <label className={styles.fileUploadLabel}>
              <Button variant="secondary">Import Settings</Button>
              <input
                className={styles.hiddenInput}
                type="file"
                accept=".json"
                onChange={handleImport}
              />
            </label>
          </Flex>
        </CardContent>
      </Card>

      <Typography variant="body2" color="secondary">
        Note: Importing settings will override all existing application
        settings. Make sure to export your current settings as a backup before
        importing.
      </Typography>
    </div>
  );
};

export default SettingsImportExport;
