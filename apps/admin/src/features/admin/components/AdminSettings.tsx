import {
  Alert,
  Button,
  Card,
  CardContent,
  Flex,
  Grid,
  H1,
  H4,
  Input,
  Loading,
  Select,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import DocumentTitle from '../../../components/common/DocumentTitle';
import { useSettings } from '../../../contexts/SettingsContext';
import type { AppSettings } from '../../../services/api';
import * as styles from './AdminSettings.css';
import EnvironmentOverrides from './EnvironmentOverrides';
import SettingsAuditLog from './SettingsAuditLog';
import SettingsImportExport from './SettingsImportExport';

// Uncomment when needed for section titles
// const SectionTitle = styled(H4)`
//   margin-top: ${({ theme }) => theme.spacing.lg};
//   margin-bottom: ${({ theme }) => theme.spacing.md};
//   border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
//   padding-bottom: ${({ theme }) => theme.spacing.xs};
// `;

const AdminSettings: React.FC = () => {
  const { settings, updateSettings, refreshSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Only refresh settings if they're not already loaded
        if (!settings) {
          await refreshSettings();
        }

        setLocalSettings(settings);
      } catch (err) {
        setError(
          'Failed to load application settings: ' +
            (err instanceof Error ? err.message : String(err))
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeSettings();
  }, [refreshSettings, settings]); // Include dependencies

  const handleInputChange = (
    section: keyof AppSettings,
    key: string,
    value: string | number | boolean | string[]
  ) => {
    if (!localSettings) return;

    setLocalSettings({
      ...localSettings,
      [section]: {
        ...localSettings[section],
        [key]: value,
      },
    });
  };

  const handleNestedInputChange = (
    section: keyof AppSettings,
    parentKey: string,
    key: string,
    value: string | number | boolean
  ) => {
    if (!localSettings) return;

    // Use a type assertion to ensure TypeScript understands the structure
    setLocalSettings({
      ...localSettings,
      [section]: {
        ...localSettings[section],
        [parentKey]: {
          // Use a more specific type assertion for nested objects
          ...((localSettings[section] as Record<string, unknown>)[
            parentKey
          ] as Record<string, unknown>),
          [key]: value,
        },
      },
    });
  };

  const handleSaveSettings = async () => {
    if (!localSettings) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      await updateSettings(localSettings);
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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleCancelSettings = () => {
    // Reset local settings to original settings from context
    setLocalSettings(settings);
    setError(null);
    setSuccessMessage(null);
  };

  if (isLoading) {
    return <Loading message="Loading application settings..." />;
  }

  if (!localSettings) {
    return <Typography>No settings available</Typography>;
  }

  return (
    <div className={styles.settingsContainer}>
      <DocumentTitle title="Admin Settings" />
      <H1 gutterBottom>Admin Settings</H1>
      <Typography>
        Configure application-wide settings and preferences
      </Typography>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <div className={styles.tabWrapper}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <TabList>
            <Tab value="general">General</Tab>
            <Tab value="security">Security</Tab>
            <Tab value="email">Email</Tab>
            <Tab value="media">Media</Tab>
            <Tab value="features">Feature Toggles</Tab>
            <Tab value="advanced">Advanced</Tab>
          </TabList>

          <TabPanel value="general">
            <div className={styles.settingsSection}>
              <Card>
                <CardContent>
                  <Grid columns={2} gap="md">
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="siteName">
                        Site Name
                      </label>
                      <Input
                        id="siteName"
                        value={localSettings.general.siteName}
                        onChange={e =>
                          handleInputChange(
                            'general',
                            'siteName',
                            e.target.value
                          )
                        }
                      />
                      <Typography className={styles.settingDescription}>
                        The name of your application that appears in the browser
                        title and emails
                      </Typography>
                    </div>

                    <div className={styles.formGroup}>
                      <label
                        className={styles.formLabel}
                        htmlFor="siteDescription"
                      >
                        Site Description
                      </label>
                      <Input
                        id="siteDescription"
                        value={localSettings.general.siteDescription}
                        onChange={e =>
                          handleInputChange(
                            'general',
                            'siteDescription',
                            e.target.value
                          )
                        }
                      />
                      <Typography className={styles.settingDescription}>
                        A brief description of your application
                      </Typography>
                    </div>
                  </Grid>

                  <Grid columns={2} gap="md">
                    <div className={styles.formGroup}>
                      <label
                        className={styles.formLabel}
                        htmlFor="defaultUserRole"
                      >
                        Default User Role
                      </label>
                      <Select
                        id="defaultUserRole"
                        value={localSettings.general.defaultUserRole}
                        onChange={e =>
                          handleInputChange(
                            'general',
                            'defaultUserRole',
                            e.target.value
                          )
                        }
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                      </Select>
                      <Typography className={styles.settingDescription}>
                        The default role assigned to new users upon registration
                      </Typography>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          className={styles.checkbox}
                          type="checkbox"
                          checked={localSettings.general.maintenanceMode}
                          onChange={e =>
                            handleInputChange(
                              'general',
                              'maintenanceMode',
                              e.target.checked
                            )
                          }
                        />
                        Maintenance Mode
                      </label>
                      <Typography className={styles.settingDescription}>
                        When enabled, only administrators can access the
                        application
                      </Typography>
                    </div>
                  </Grid>
                </CardContent>
              </Card>
            </div>
          </TabPanel>

          <TabPanel value="security">
            <div className={styles.settingsSection}>
              <Card>
                <CardContent>
                  <Grid columns={2} gap="md">
                    <div className={styles.formGroup}>
                      <label
                        className={styles.formLabel}
                        htmlFor="sessionTimeout"
                      >
                        Session Timeout (minutes)
                      </label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={localSettings.security.sessionTimeout}
                        onChange={e =>
                          handleInputChange(
                            'security',
                            'sessionTimeout',
                            parseInt(e.target.value)
                          )
                        }
                      />
                      <Typography className={styles.settingDescription}>
                        How long a user session remains active before requiring
                        re-login
                      </Typography>
                    </div>

                    <div className={styles.formGroup}>
                      <label
                        className={styles.formLabel}
                        htmlFor="maxLoginAttempts"
                      >
                        Max Login Attempts
                      </label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={localSettings.security.maxLoginAttempts}
                        onChange={e =>
                          handleInputChange(
                            'security',
                            'maxLoginAttempts',
                            parseInt(e.target.value)
                          )
                        }
                      />
                      <Typography className={styles.settingDescription}>
                        Number of failed login attempts before account lockout
                      </Typography>
                    </div>
                  </Grid>

                  <Grid columns={1} gap="md">
                    <div className={styles.formGroup}>
                      <H4>Password Policy</H4>
                      <Grid columns={2} gap="md">
                        <div className={styles.formGroup}>
                          <label
                            className={styles.formLabel}
                            htmlFor="minLength"
                          >
                            Minimum Length
                          </label>
                          <Input
                            id="minLength"
                            type="number"
                            value={
                              localSettings.security.passwordPolicy.minLength
                            }
                            onChange={e =>
                              handleNestedInputChange(
                                'security',
                                'passwordPolicy',
                                'minLength',
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </div>
                      </Grid>

                      <Grid columns={2} gap="md">
                        <div className={styles.formGroup}>
                          <label className={styles.checkboxLabel}>
                            <input
                              className={styles.checkbox}
                              type="checkbox"
                              checked={
                                localSettings.security.passwordPolicy
                                  .requireUppercase
                              }
                              onChange={e =>
                                handleNestedInputChange(
                                  'security',
                                  'passwordPolicy',
                                  'requireUppercase',
                                  e.target.checked
                                )
                              }
                            />
                            Require Uppercase
                          </label>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.checkboxLabel}>
                            <input
                              className={styles.checkbox}
                              type="checkbox"
                              checked={
                                localSettings.security.passwordPolicy
                                  .requireLowercase
                              }
                              onChange={e =>
                                handleNestedInputChange(
                                  'security',
                                  'passwordPolicy',
                                  'requireLowercase',
                                  e.target.checked
                                )
                              }
                            />
                            Require Lowercase
                          </label>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.checkboxLabel}>
                            <input
                              className={styles.checkbox}
                              type="checkbox"
                              checked={
                                localSettings.security.passwordPolicy
                                  .requireNumbers
                              }
                              onChange={e =>
                                handleNestedInputChange(
                                  'security',
                                  'passwordPolicy',
                                  'requireNumbers',
                                  e.target.checked
                                )
                              }
                            />
                            Require Numbers
                          </label>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.checkboxLabel}>
                            <input
                              className={styles.checkbox}
                              type="checkbox"
                              checked={
                                localSettings.security.passwordPolicy
                                  .requireSpecialChars
                              }
                              onChange={e =>
                                handleNestedInputChange(
                                  'security',
                                  'passwordPolicy',
                                  'requireSpecialChars',
                                  e.target.checked
                                )
                              }
                            />
                            Require Special Characters
                          </label>
                        </div>
                      </Grid>
                    </div>

                    <div className={styles.formGroup}>
                      <H4>Two-Factor Authentication</H4>
                      <Grid columns={2} gap="md">
                        <div className={styles.formGroup}>
                          <label className={styles.checkboxLabel}>
                            <input
                              className={styles.checkbox}
                              type="checkbox"
                              checked={
                                localSettings.security.twoFactorAuth.enabled
                              }
                              onChange={e =>
                                handleNestedInputChange(
                                  'security',
                                  'twoFactorAuth',
                                  'enabled',
                                  e.target.checked
                                )
                              }
                            />
                            Enable Two-Factor Authentication
                          </label>
                          <Typography className={styles.settingDescription}>
                            Allow users to enable 2FA for their accounts
                          </Typography>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.checkboxLabel}>
                            <input
                              className={styles.checkbox}
                              type="checkbox"
                              checked={
                                localSettings.security.twoFactorAuth
                                  .requiredForAdmins
                              }
                              onChange={e =>
                                handleNestedInputChange(
                                  'security',
                                  'twoFactorAuth',
                                  'requiredForAdmins',
                                  e.target.checked
                                )
                              }
                            />
                            Require for Administrators
                          </label>
                          <Typography className={styles.settingDescription}>
                            Force administrators to use 2FA
                          </Typography>
                        </div>
                      </Grid>
                    </div>
                  </Grid>
                </CardContent>
              </Card>
            </div>
          </TabPanel>

          <TabPanel value="email">
            <div className={styles.settingsSection}>
              <Card>
                <CardContent>
                  <Grid columns={2} gap="md">
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="smtpServer">
                        SMTP Server
                      </label>
                      <Input
                        id="smtpServer"
                        value={localSettings.email.smtpServer}
                        onChange={e =>
                          handleInputChange(
                            'email',
                            'smtpServer',
                            e.target.value
                          )
                        }
                      />
                      <Typography className={styles.settingDescription}>
                        SMTP server hostname for sending emails
                      </Typography>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="smtpPort">
                        SMTP Port
                      </label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={localSettings.email.smtpPort}
                        onChange={e =>
                          handleInputChange(
                            'email',
                            'smtpPort',
                            parseInt(e.target.value)
                          )
                        }
                      />
                      <Typography className={styles.settingDescription}>
                        SMTP server port (usually 587 or 465)
                      </Typography>
                    </div>

                    <div className={styles.formGroup}>
                      <label
                        className={styles.formLabel}
                        htmlFor="smtpUsername"
                      >
                        SMTP Username
                      </label>
                      <Input
                        id="smtpUsername"
                        value={localSettings.email.smtpUsername}
                        onChange={e =>
                          handleInputChange(
                            'email',
                            'smtpUsername',
                            e.target.value
                          )
                        }
                      />
                      <Typography className={styles.settingDescription}>
                        Username for SMTP authentication
                      </Typography>
                    </div>

                    <div className={styles.formGroup}>
                      <label
                        className={styles.formLabel}
                        htmlFor="smtpPassword"
                      >
                        SMTP Password
                      </label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={localSettings.email.smtpPassword}
                        onChange={e =>
                          handleInputChange(
                            'email',
                            'smtpPassword',
                            e.target.value
                          )
                        }
                      />
                      <Typography className={styles.settingDescription}>
                        Password for SMTP authentication
                      </Typography>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="senderEmail">
                        Sender Email
                      </label>
                      <Input
                        id="senderEmail"
                        type="email"
                        value={localSettings.email.senderEmail}
                        onChange={e =>
                          handleInputChange(
                            'email',
                            'senderEmail',
                            e.target.value
                          )
                        }
                      />
                      <Typography className={styles.settingDescription}>
                        Email address shown as the sender
                      </Typography>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="senderName">
                        Sender Name
                      </label>
                      <Input
                        id="senderName"
                        value={localSettings.email.senderName}
                        onChange={e =>
                          handleInputChange(
                            'email',
                            'senderName',
                            e.target.value
                          )
                        }
                      />
                      <Typography className={styles.settingDescription}>
                        Name shown as the sender
                      </Typography>
                    </div>
                  </Grid>
                </CardContent>
              </Card>
            </div>
          </TabPanel>

          <TabPanel value="media">
            <div className={styles.settingsSection}>
              <Card>
                <CardContent>
                  <Grid columns={2} gap="md">
                    <div className={styles.formGroup}>
                      <label
                        className={styles.formLabel}
                        htmlFor="maxUploadSize"
                      >
                        Max Upload Size (MB)
                      </label>
                      <Input
                        id="maxUploadSize"
                        type="number"
                        value={localSettings.media.maxUploadSize}
                        onChange={e =>
                          handleInputChange(
                            'media',
                            'maxUploadSize',
                            parseInt(e.target.value)
                          )
                        }
                      />
                      <Typography className={styles.settingDescription}>
                        Maximum file size for uploads in megabytes
                      </Typography>
                    </div>

                    <div className={styles.formGroup}>
                      <label
                        className={styles.formLabel}
                        htmlFor="imageQuality"
                      >
                        Image Quality
                      </label>
                      <Input
                        id="imageQuality"
                        type="number"
                        min="1"
                        max="100"
                        value={localSettings.media.imageQuality}
                        onChange={e =>
                          handleInputChange(
                            'media',
                            'imageQuality',
                            parseInt(e.target.value)
                          )
                        }
                      />
                      <Typography className={styles.settingDescription}>
                        Image compression quality (1-100)
                      </Typography>
                    </div>

                    <div className={styles.formGroup}>
                      <label
                        className={styles.formLabel}
                        htmlFor="storageProvider"
                      >
                        Storage Provider
                      </label>
                      <Select
                        id="storageProvider"
                        value={localSettings.media.storageProvider}
                        onChange={e =>
                          handleInputChange(
                            'media',
                            'storageProvider',
                            e.target.value
                          )
                        }
                      >
                        <option value="local">Local Storage</option>
                        <option value="s3">Amazon S3</option>
                        <option value="cloudinary">Cloudinary</option>
                      </Select>
                      <Typography className={styles.settingDescription}>
                        Storage provider for media files
                      </Typography>
                    </div>
                  </Grid>
                </CardContent>
              </Card>
            </div>
          </TabPanel>

          <TabPanel value="features">
            <div className={styles.settingsSection}>
              <Card>
                <CardContent>
                  <Grid columns={2} gap="md">
                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          className={styles.checkbox}
                          type="checkbox"
                          checked={localSettings.features.enableMatching}
                          onChange={e =>
                            handleInputChange(
                              'features',
                              'enableMatching',
                              e.target.checked
                            )
                          }
                        />
                        Enable Matching
                      </label>
                      <Typography className={styles.settingDescription}>
                        Allow users to match with others based on preferences
                      </Typography>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          className={styles.checkbox}
                          type="checkbox"
                          checked={localSettings.features.enableUserProfiles}
                          onChange={e =>
                            handleInputChange(
                              'features',
                              'enableUserProfiles',
                              e.target.checked
                            )
                          }
                        />
                        Enable User Profiles
                      </label>
                      <Typography className={styles.settingDescription}>
                        Allow users to create and customize their profiles
                      </Typography>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          className={styles.checkbox}
                          type="checkbox"
                          checked={localSettings.features.enableNotifications}
                          onChange={e =>
                            handleInputChange(
                              'features',
                              'enableNotifications',
                              e.target.checked
                            )
                          }
                        />
                        Enable Notifications
                      </label>
                      <Typography className={styles.settingDescription}>
                        Send notifications to users about app activities
                      </Typography>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          className={styles.checkbox}
                          type="checkbox"
                          checked={localSettings.features.enableActivityFeed}
                          onChange={e =>
                            handleInputChange(
                              'features',
                              'enableActivityFeed',
                              e.target.checked
                            )
                          }
                        />
                        Enable Activity Feed
                      </label>
                      <Typography className={styles.settingDescription}>
                        Show recent activities in user feeds
                      </Typography>
                    </div>
                  </Grid>
                </CardContent>
              </Card>
            </div>
          </TabPanel>

          <TabPanel value="advanced">
            <div className={styles.settingsSection}>
              <Grid columns={1} gap="lg">
                <EnvironmentOverrides />
                <SettingsImportExport />
                <SettingsAuditLog />
              </Grid>
            </div>
          </TabPanel>
        </Tabs>
      </div>

      <div className={styles.submitButtonContainer}>
        <Flex justifyContent="flex-end" gap="md">
          <Button variant="secondary" onClick={handleCancelSettings}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Flex>
      </div>
    </div>
  );
};

export default AdminSettings;
