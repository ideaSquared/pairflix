import {
  Alert,
  Button,
  Card,
  CardContent,
  Flex,
  Grid,
  H1,
  H2,
  Loading,
  Typography,
} from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import DocumentTitle from '../../../components/common/DocumentTitle';
import { useSettings } from '../../../contexts/SettingsContext';
import type { SettingsTree } from '../../../services/api';
import * as styles from './AdminSettings.css';
import SettingsAuditLog from './SettingsAuditLog';
import SettingsImportExport from './SettingsImportExport';

// The only settings key the backend actually reads (services/api/src/hono/lib/featureFlags.ts);
// everything else in the tree is free-form and only editable via the JSON import/export below.
// The API nests dot-path keys into an object, so this reads/writes `{ recommendation: { llm_rerank } }`,
// not a flat 'recommendation.llm_rerank' key -- see services/api/src/hono/lib/adminSettings.ts.
const readLlmRerank = (tree: SettingsTree | null): boolean => {
  const recommendation = tree?.recommendation;
  return (
    typeof recommendation === 'object' &&
    recommendation !== null &&
    (recommendation as Record<string, unknown>).llm_rerank === true
  );
};

const AdminSettings: React.FC = () => {
  const {
    settings,
    isLoading,
    error: loadError,
    updateSettings,
  } = useSettings();
  const [llmRerank, setLlmRerank] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setLlmRerank(readLlmRerank(settings));
  }, [settings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      await updateSettings({ recommendation: { llm_rerank: llmRerank } });
      setSuccessMessage('Settings updated successfully');
    } catch (err) {
      setError(
        'Failed to update settings: ' +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLlmRerank(readLlmRerank(settings));
    setError(null);
    setSuccessMessage(null);
  };

  if (isLoading) {
    return <Loading message="Loading application settings..." />;
  }

  return (
    <div className={styles.settingsContainer}>
      <DocumentTitle title="Admin Settings" />
      <H1 gutterBottom>Admin Settings</H1>
      <Typography>
        Configure application-wide settings and preferences
      </Typography>

      {(error || loadError) && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error || loadError}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <div className={styles.settingsSection}>
        <Card>
          <CardContent>
            <H2 gutterBottom>Recommendations</H2>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  className={styles.checkbox}
                  type="checkbox"
                  checked={llmRerank}
                  onChange={e => setLlmRerank(e.target.checked)}
                />
                Enable LLM Re-rank
              </label>
              <Typography className={styles.settingDescription}>
                Use the premium LLM re-ranker to refine tonight&apos;s pick
                after the ML recommender narrows the shortlist.
              </Typography>
            </div>

            <Flex
              justifyContent="flex-end"
              gap="md"
              className={styles.submitButtonContainer}
            >
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Flex>
          </CardContent>
        </Card>
      </div>

      <Grid columns={1} gap="lg" className={styles.settingsSection}>
        <SettingsImportExport />
        <SettingsAuditLog />
      </Grid>
    </div>
  );
};

export default AdminSettings;
