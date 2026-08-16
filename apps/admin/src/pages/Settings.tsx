import { Button, H1, Loading } from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import * as styles from './Settings.css';
import { admin, type AppSettings as ApiAppSettings } from '../services/api';

interface AppSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    defaultUserRole: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    twoFactorAuth: {
      enabled: boolean;
      requiredForAdmins: boolean;
    };
  };
  features: {
    enableMatching: boolean;
    enableUserProfiles: boolean;
    enableNotifications: boolean;
    enableActivityFeed: boolean;
  };
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await admin.settings.get();
        setSettings(response.settings as AppSettings);
      } catch (error) {
        console.error('Error fetching app settings:', error);
        setError('Failed to fetch app settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Convert our local settings to the API's expected format
      const apiSettings = { ...settings } as unknown as ApiAppSettings;

      await admin.settings.update(apiSettings);
      setSuccessMessage('Settings updated successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating app settings:', error);
      setError('Failed to update app settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    section: keyof AppSettings,
    key: string,
    value: string | number | boolean
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
  };

  const handlePasswordPolicyChange = (
    key: string,
    value: string | number | boolean
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      security: {
        ...settings.security,
        passwordPolicy: {
          ...settings.security.passwordPolicy,
          [key]: value,
        },
      },
    });
  };

  if (isLoading) return <Loading message="Loading settings..." />;
  if (!settings) return <div>No settings available.</div>;

  return (
    <div className={styles.settingsContainer}>
      <H1>System Settings</H1>
      <p>Configure application-wide settings and features.</p>

      {error && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#ffeeee',
            color: '#d32f2f',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#eeffee',
            color: '#2e7d32',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          {successMessage}
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>General Settings</h2>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="siteName">
            Site Name
          </label>
          <input
            id="siteName"
            className={styles.input}
            value={settings.general.siteName}
            onChange={e => handleChange('general', 'siteName', e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="siteDescription">
            Site Description
          </label>
          <input
            id="siteDescription"
            className={styles.input}
            value={settings.general.siteDescription}
            onChange={e =>
              handleChange('general', 'siteDescription', e.target.value)
            }
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={settings.general.maintenanceMode}
              onChange={e =>
                handleChange('general', 'maintenanceMode', e.target.checked)
              }
            />
            Maintenance Mode
          </label>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="defaultUserRole">
            Default User Role
          </label>
          <select
            id="defaultUserRole"
            className={styles.select}
            value={settings.general.defaultUserRole}
            onChange={e =>
              handleChange('general', 'defaultUserRole', e.target.value)
            }
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Security Settings</h2>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="sessionTimeout">
            Session Timeout (minutes)
          </label>
          <input
            id="sessionTimeout"
            className={styles.input}
            type="number"
            value={settings.security.sessionTimeout}
            onChange={e =>
              handleChange(
                'security',
                'sessionTimeout',
                parseInt(e.target.value)
              )
            }
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="maxLoginAttempts">
            Max Login Attempts
          </label>
          <input
            id="maxLoginAttempts"
            className={styles.input}
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={e =>
              handleChange(
                'security',
                'maxLoginAttempts',
                parseInt(e.target.value)
              )
            }
          />
        </div>

        <h2 className={styles.sectionTitle}>Password Policy</h2>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="minLength">
            Minimum Length
          </label>
          <input
            id="minLength"
            className={styles.input}
            type="number"
            value={settings.security.passwordPolicy.minLength}
            onChange={e =>
              handlePasswordPolicyChange('minLength', parseInt(e.target.value))
            }
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={settings.security.passwordPolicy.requireUppercase}
              onChange={e =>
                handlePasswordPolicyChange('requireUppercase', e.target.checked)
              }
            />
            Require Uppercase Letters
          </label>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={settings.security.passwordPolicy.requireLowercase}
              onChange={e =>
                handlePasswordPolicyChange('requireLowercase', e.target.checked)
              }
            />
            Require Lowercase Letters
          </label>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={settings.security.passwordPolicy.requireNumbers}
              onChange={e =>
                handlePasswordPolicyChange('requireNumbers', e.target.checked)
              }
            />
            Require Numbers
          </label>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={settings.security.passwordPolicy.requireSpecialChars}
              onChange={e =>
                handlePasswordPolicyChange(
                  'requireSpecialChars',
                  e.target.checked
                )
              }
            />
            Require Special Characters
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Feature Flags</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={settings.features.enableMatching}
              onChange={e =>
                handleChange('features', 'enableMatching', e.target.checked)
              }
            />
            Enable Matching
          </label>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={settings.features.enableUserProfiles}
              onChange={e =>
                handleChange('features', 'enableUserProfiles', e.target.checked)
              }
            />
            Enable User Profiles
          </label>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={settings.features.enableNotifications}
              onChange={e =>
                handleChange(
                  'features',
                  'enableNotifications',
                  e.target.checked
                )
              }
            />
            Enable Notifications
          </label>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={settings.features.enableActivityFeed}
              onChange={e =>
                handleChange('features', 'enableActivityFeed', e.target.checked)
              }
            />
            Enable Activity Feed
          </label>
        </div>
      </section>

      <div className={styles.buttonContainer}>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
