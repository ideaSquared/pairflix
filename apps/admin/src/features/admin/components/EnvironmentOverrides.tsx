import {
  Alert,
  Button,
  Card,
  CardContent,
  Flex,
  Grid,
  H2,
  H3,
  Tab,
  TabList,
  Tabs,
  Typography,
} from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import { useSettings } from '../../../contexts/SettingsContext';
import type { AppSettings } from '../../../services/api';
import * as styles from './EnvironmentOverrides.css';

type Environment = 'development' | 'staging' | 'production';

interface EnvironmentOverride {
  environment: Environment;
  overrides: Partial<AppSettings>;
  isActive: boolean;
}

const EnvironmentOverrides: React.FC = () => {
  const { settings } = useSettings();
  const [overrides, setOverrides] = useState<EnvironmentOverride[]>([
    { environment: 'development', overrides: {}, isActive: false },
    { environment: 'staging', overrides: {}, isActive: false },
    { environment: 'production', overrides: {}, isActive: false },
  ]);
  const [activeTab, setActiveTab] = useState<Environment>('development');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonContent, setJsonContent] = useState<string>('{}');

  // We're simulating loading overrides from a backend/local storage
  // In a real implementation, you would fetch these from your backend
  useEffect(() => {
    // Mock loading overrides from storage
    const loadOverrides = () => {
      try {
        const savedOverrides = localStorage.getItem('environmentOverrides');
        if (savedOverrides) {
          const parsed = JSON.parse(savedOverrides) as EnvironmentOverride[];
          setOverrides(parsed);
          updateEditor(
            parsed.find(o => o.environment === activeTab)?.overrides || {}
          );
        }
      } catch (err) {
        console.error('Failed to load environment overrides:', err);
      }
    };

    loadOverrides();
  }, [activeTab]);

  const updateEditor = (content: Partial<AppSettings>) => {
    setJsonContent(JSON.stringify(content, null, 2));
    setJsonError(null);
  };

  const handleTabChange = (tab: string) => {
    const newTab = tab as Environment;
    setActiveTab(newTab);

    // Update editor content for the selected environment
    const selectedOverride = overrides.find(o => o.environment === newTab);
    updateEditor(selectedOverride?.overrides || {});
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value);
    setJsonError(null);
  };

  const validateAndSave = () => {
    setError(null);
    setSuccess(null);
    setJsonError(null);

    try {
      // Validate JSON
      const parsed = JSON.parse(jsonContent);

      // Update the override for the current environment
      const updatedOverrides = overrides.map(override => {
        if (override.environment === activeTab) {
          return {
            ...override,
            overrides: parsed,
          };
        }
        return override;
      });

      setOverrides(updatedOverrides);

      // Save to storage or backend
      localStorage.setItem(
        'environmentOverrides',
        JSON.stringify(updatedOverrides)
      );

      setSuccess(
        `Settings overrides for ${activeTab} environment saved successfully`
      );
    } catch (err) {
      setJsonError(
        `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  const toggleOverrideActive = (env: Environment) => {
    const updatedOverrides = overrides.map(override => {
      if (override.environment === env) {
        return {
          ...override,
          isActive: !override.isActive,
        };
      }
      return override;
    });

    setOverrides(updatedOverrides);
    localStorage.setItem(
      'environmentOverrides',
      JSON.stringify(updatedOverrides)
    );
    setSuccess(
      `${env} environment overrides ${updatedOverrides.find(o => o.environment === env)?.isActive ? 'enabled' : 'disabled'}`
    );
  };

  const getCurrentEnv = (): Environment => {
    // In a real implementation, this would detect the actual environment
    // For now, we'll base it on the hostname
    if (window.location.hostname.includes('staging')) {
      return 'staging';
    } else if (
      window.location.hostname.includes('localhost') ||
      window.location.hostname.includes('127.0.0.1')
    ) {
      return 'development';
    } else {
      return 'production';
    }
  };

  const currentEnv = getCurrentEnv();

  return (
    <div className={styles.container}>
      <Flex justifyContent="space-between" alignItems="center">
        <H2 gutterBottom>Environment-specific Overrides</H2>
        <Typography>
          Current Environment:{' '}
          <span className={styles.environmentLabel({ env: currentEnv })}>
            {currentEnv}
          </span>
        </Typography>
      </Flex>
      <Typography gutterBottom>
        Configure settings that apply only to specific environments. These
        overrides take precedence over the default settings.
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

      <Grid columns={3} gap="md" style={{ marginBottom: '1rem' }}>
        {overrides.map(override => (
          <Card key={override.environment} className={styles.overrideCard}>
            <CardContent>
              <Flex justifyContent="space-between" alignItems="center">
                <div>
                  <H3 gutterBottom>
                    {override.environment.charAt(0).toUpperCase() +
                      override.environment.slice(1)}
                  </H3>
                  <Typography variant="body2">
                    {Object.keys(override.overrides).length} override
                    {Object.keys(override.overrides).length !== 1 ? 's' : ''}
                  </Typography>
                </div>
                <Button
                  variant={override.isActive ? 'primary' : 'secondary'}
                  onClick={() => toggleOverrideActive(override.environment)}
                >
                  {override.isActive ? 'Enabled' : 'Disabled'}
                </Button>
              </Flex>
            </CardContent>
          </Card>
        ))}
      </Grid>

      <Card>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <TabList>
            <Tab value="development">Development</Tab>
            <Tab value="staging">Staging</Tab>
            <Tab value="production">Production</Tab>
          </TabList>
        </Tabs>

        <CardContent>
          <Typography gutterBottom>
            Edit JSON overrides for {activeTab} environment:
          </Typography>

          {jsonError && (
            <Alert variant="error" onClose={() => setJsonError(null)}>
              {jsonError}
            </Alert>
          )}

          <textarea
            className={styles.codeEditor}
            value={jsonContent}
            onChange={handleJsonChange}
            spellCheck="false"
          />

          <Flex
            className={styles.buttonGroup}
            justifyContent="flex-end"
            gap="md"
          >
            <Button
              variant="secondary"
              onClick={() => {
                if (settings) {
                  updateEditor(settings);
                }
              }}
            >
              Load Current Settings
            </Button>
            <Button variant="secondary" onClick={() => updateEditor({})}>
              Clear
            </Button>
            <Button variant="primary" onClick={validateAndSave}>
              Save Overrides
            </Button>
          </Flex>
        </CardContent>
      </Card>

      <Typography
        variant="body2"
        color="secondary"
        style={{ marginTop: '1rem' }}
      >
        Note: Environment overrides apply only when enabled and in the correct
        environment. When a setting is overridden, it completely replaces the
        default value.
      </Typography>
    </div>
  );
};

export default EnvironmentOverrides;
