import { Alert, Button, Card, CardContent, Flex, Grid, H1, H4, Input, Loading, Select, Tabs, Typography } from '@pairflix/components'
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
;
;
;
import DocumentTitle from '../../../components/common/DocumentTitle';
;
;
;
;
;
;
import { useSettings } from '../../../contexts/SettingsContext';
import { AppSettings } from '../../../services/api';
import EnvironmentOverrides from './EnvironmentOverrides';
import SettingsAuditLog from './SettingsAuditLog';
import SettingsImportExport from './SettingsImportExport';

// Styled components
const SettingsContainer = styled.div`
	padding-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SettingsSection = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled(H4)`
	margin-top: ${({ theme }) => theme.spacing.lg};
	margin-bottom: ${({ theme }) => theme.spacing.md};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
	padding-bottom: ${({ theme }) => theme.spacing.xs};
`;

const FormGroup = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FormLabel = styled.label`
	display: block;
	margin-bottom: ${({ theme }) => theme.spacing.xs};
	font-weight: 500;
`;

const CheckboxLabel = styled.label`
	display: flex;
	align-items: center;
	cursor: pointer;
	margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Checkbox = styled.input`
	margin-right: ${({ theme }) => theme.spacing.sm};
`;

const SettingDescription = styled(Typography)`
	color: ${({ theme }) => theme.colors.text.secondary};
	font-size: 0.85rem;
	margin-top: ${({ theme }) => theme.spacing.xs};
`;

const SubmitButtonContainer = styled.div`
	margin-top: ${({ theme }) => theme.spacing.lg};
	padding-top: ${({ theme }) => theme.spacing.md};
	border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const TabWrapper = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

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
	}, []); // Empty dependency array - run only once when component mounts

	const handleInputChange = (
		section: keyof AppSettings,
		key: string,
		value: any
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
		value: any
	) => {
		if (!localSettings) return;

		// Use a type assertion to ensure TypeScript understands the structure
		setLocalSettings({
			...localSettings,
			[section]: {
				...localSettings[section],
				[parentKey]: {
					// Use a type assertion to tell TypeScript this is a safe object to spread
					...(localSettings[section] as any)[parentKey],
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

	if (isLoading) {
		return <Loading message='Loading application settings...' />;
	}

	if (!localSettings) {
		return <Typography>No settings available</Typography>;
	}

	return (
		<SettingsContainer>
			<DocumentTitle title='Admin Settings' />
			<H1 gutterBottom>Admin Settings</H1>
			<Typography>
				Configure application-wide settings and preferences
			</Typography>

			{error && (
				<Alert variant='error' onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			{successMessage && (
				<Alert variant='success' onClose={() => setSuccessMessage(null)}>
					{successMessage}
				</Alert>
			)}

			<TabWrapper>
				<Tabs
					tabs={[
						{ id: 'general', label: 'General' },
						{ id: 'security', label: 'Security' },
						{ id: 'email', label: 'Email' },
						{ id: 'media', label: 'Media' },
						{ id: 'features', label: 'Feature Toggles' },
						{ id: 'advanced', label: 'Advanced' },
					]}
					activeTab={activeTab}
					onChange={handleTabChange}
				/>
			</TabWrapper>

			{activeTab === 'general' && (
				<SettingsSection>
					<Card>
						<CardContent>
							<Grid columns={2} gap='md'>
								<FormGroup>
									<FormLabel htmlFor='siteName'>Site Name</FormLabel>
									<Input
										id='siteName'
										value={localSettings.general.siteName}
										onChange={(e) =>
											handleInputChange('general', 'siteName', e.target.value)
										}
									/>
									<SettingDescription>
										The name of your application that appears in the browser
										title and emails
									</SettingDescription>
								</FormGroup>

								<FormGroup>
									<FormLabel htmlFor='siteDescription'>
										Site Description
									</FormLabel>
									<Input
										id='siteDescription'
										value={localSettings.general.siteDescription}
										onChange={(e) =>
											handleInputChange(
												'general',
												'siteDescription',
												e.target.value
											)
										}
									/>
									<SettingDescription>
										A brief description of your application
									</SettingDescription>
								</FormGroup>
							</Grid>

							<Grid columns={2} gap='md'>
								<FormGroup>
									<FormLabel htmlFor='defaultUserRole'>
										Default User Role
									</FormLabel>
									<Select
										id='defaultUserRole'
										value={localSettings.general.defaultUserRole}
										onChange={(e) =>
											handleInputChange(
												'general',
												'defaultUserRole',
												e.target.value
											)
										}
									>
										<option value='user'>User</option>
										<option value='moderator'>Moderator</option>
									</Select>
									<SettingDescription>
										The default role assigned to new users upon registration
									</SettingDescription>
								</FormGroup>

								<FormGroup>
									<CheckboxLabel>
										<Checkbox
											type='checkbox'
											checked={localSettings.general.maintenanceMode}
											onChange={(e) =>
												handleInputChange(
													'general',
													'maintenanceMode',
													e.target.checked
												)
											}
										/>
										Maintenance Mode
									</CheckboxLabel>
									<SettingDescription>
										When enabled, only administrators can access the application
									</SettingDescription>
								</FormGroup>
							</Grid>
						</CardContent>
					</Card>
				</SettingsSection>
			)}

			{activeTab === 'security' && (
				<SettingsSection>
					<Card>
						<CardContent>
							<Grid columns={2} gap='md'>
								<FormGroup>
									<FormLabel htmlFor='sessionTimeout'>
										Session Timeout (minutes)
									</FormLabel>
									<Input
										id='sessionTimeout'
										type='number'
										value={localSettings.security.sessionTimeout}
										onChange={(e) =>
											handleInputChange(
												'security',
												'sessionTimeout',
												parseInt(e.target.value)
											)
										}
									/>
									<SettingDescription>
										How long a user session remains active before requiring
										re-login
									</SettingDescription>
								</FormGroup>

								<FormGroup>
									<FormLabel htmlFor='maxLoginAttempts'>
										Max Login Attempts
									</FormLabel>
									<Input
										id='maxLoginAttempts'
										type='number'
										value={localSettings.security.maxLoginAttempts}
										onChange={(e) =>
											handleInputChange(
												'security',
												'maxLoginAttempts',
												parseInt(e.target.value)
											)
										}
									/>
									<SettingDescription>
										Number of failed login attempts before account is
										temporarily locked
									</SettingDescription>
								</FormGroup>
							</Grid>

							<H4>Password Policy</H4>
							<Grid columns={2} gap='md'>
								<FormGroup>
									<FormLabel htmlFor='minLength'>
										Minimum Password Length
									</FormLabel>
									<Input
										id='minLength'
										type='number'
										value={localSettings.security.passwordPolicy.minLength}
										onChange={(e) =>
											handleNestedInputChange(
												'security',
												'passwordPolicy',
												'minLength',
												parseInt(e.target.value)
											)
										}
									/>
								</FormGroup>

								<FormGroup>
									<CheckboxLabel>
										<Checkbox
											type='checkbox'
											checked={
												localSettings.security.passwordPolicy.requireUppercase
											}
											onChange={(e) =>
												handleNestedInputChange(
													'security',
													'passwordPolicy',
													'requireUppercase',
													e.target.checked
												)
											}
										/>
										Require Uppercase Letters
									</CheckboxLabel>

									<CheckboxLabel>
										<Checkbox
											type='checkbox'
											checked={
												localSettings.security.passwordPolicy.requireLowercase
											}
											onChange={(e) =>
												handleNestedInputChange(
													'security',
													'passwordPolicy',
													'requireLowercase',
													e.target.checked
												)
											}
										/>
										Require Lowercase Letters
									</CheckboxLabel>

									<CheckboxLabel>
										<Checkbox
											type='checkbox'
											checked={
												localSettings.security.passwordPolicy.requireNumbers
											}
											onChange={(e) =>
												handleNestedInputChange(
													'security',
													'passwordPolicy',
													'requireNumbers',
													e.target.checked
												)
											}
										/>
										Require Numbers
									</CheckboxLabel>

									<CheckboxLabel>
										<Checkbox
											type='checkbox'
											checked={
												localSettings.security.passwordPolicy
													.requireSpecialChars
											}
											onChange={(e) =>
												handleNestedInputChange(
													'security',
													'passwordPolicy',
													'requireSpecialChars',
													e.target.checked
												)
											}
										/>
										Require Special Characters
									</CheckboxLabel>
								</FormGroup>
							</Grid>

							<H4>Two-Factor Authentication</H4>
							<Grid columns={2} gap='md'>
								<FormGroup>
									<CheckboxLabel>
										<Checkbox
											type='checkbox'
											checked={localSettings.security.twoFactorAuth.enabled}
											onChange={(e) =>
												handleNestedInputChange(
													'security',
													'twoFactorAuth',
													'enabled',
													e.target.checked
												)
											}
										/>
										Enable Two-Factor Authentication
									</CheckboxLabel>
									<SettingDescription>
										Allow users to set up two-factor authentication for their
										accounts
									</SettingDescription>
								</FormGroup>

								<FormGroup>
									<CheckboxLabel>
										<Checkbox
											type='checkbox'
											checked={
												localSettings.security.twoFactorAuth.requiredForAdmins
											}
											onChange={(e) =>
												handleNestedInputChange(
													'security',
													'twoFactorAuth',
													'requiredForAdmins',
													e.target.checked
												)
											}
										/>
										Required for Administrators
									</CheckboxLabel>
									<SettingDescription>
										Force all administrator accounts to use two-factor
										authentication
									</SettingDescription>
								</FormGroup>
							</Grid>
						</CardContent>
					</Card>
				</SettingsSection>
			)}

			{activeTab === 'email' && (
				<SettingsSection>
					<Card>
						<CardContent>
							<Grid columns={2} gap='md'>
								<FormGroup>
									<FormLabel htmlFor='smtpServer'>SMTP Server</FormLabel>
									<Input
										id='smtpServer'
										value={localSettings.email.smtpServer}
										onChange={(e) =>
											handleInputChange('email', 'smtpServer', e.target.value)
										}
									/>
								</FormGroup>

								<FormGroup>
									<FormLabel htmlFor='smtpPort'>SMTP Port</FormLabel>
									<Input
										id='smtpPort'
										type='number'
										value={localSettings.email.smtpPort}
										onChange={(e) =>
											handleInputChange(
												'email',
												'smtpPort',
												parseInt(e.target.value)
											)
										}
									/>
								</FormGroup>
							</Grid>

							<Grid columns={2} gap='md'>
								<FormGroup>
									<FormLabel htmlFor='smtpUsername'>SMTP Username</FormLabel>
									<Input
										id='smtpUsername'
										value={localSettings.email.smtpUsername}
										onChange={(e) =>
											handleInputChange('email', 'smtpUsername', e.target.value)
										}
									/>
								</FormGroup>

								<FormGroup>
									<FormLabel htmlFor='smtpPassword'>SMTP Password</FormLabel>
									<Input
										id='smtpPassword'
										type='password'
										value={localSettings.email.smtpPassword}
										onChange={(e) =>
											handleInputChange('email', 'smtpPassword', e.target.value)
										}
									/>
								</FormGroup>
							</Grid>

							<Grid columns={2} gap='md'>
								<FormGroup>
									<FormLabel htmlFor='senderEmail'>Sender Email</FormLabel>
									<Input
										id='senderEmail'
										type='email'
										value={localSettings.email.senderEmail}
										onChange={(e) =>
											handleInputChange('email', 'senderEmail', e.target.value)
										}
									/>
								</FormGroup>

								<FormGroup>
									<FormLabel htmlFor='senderName'>Sender Name</FormLabel>
									<Input
										id='senderName'
										value={localSettings.email.senderName}
										onChange={(e) =>
											handleInputChange('email', 'senderName', e.target.value)
										}
									/>
								</FormGroup>
							</Grid>

							<FormGroup>
								<FormLabel htmlFor='emailTemplatesPath'>
									Email Templates Path
								</FormLabel>
								<Input
									id='emailTemplatesPath'
									value={localSettings.email.emailTemplatesPath}
									onChange={(e) =>
										handleInputChange(
											'email',
											'emailTemplatesPath',
											e.target.value
										)
									}
								/>
								<SettingDescription>
									Path to the directory containing email templates
								</SettingDescription>
							</FormGroup>
						</CardContent>
					</Card>
				</SettingsSection>
			)}

			{activeTab === 'media' && (
				<SettingsSection>
					<Card>
						<CardContent>
							<Grid columns={2} gap='md'>
								<FormGroup>
									<FormLabel htmlFor='maxUploadSize'>
										Max Upload Size (MB)
									</FormLabel>
									<Input
										id='maxUploadSize'
										type='number'
										value={localSettings.media.maxUploadSize}
										onChange={(e) =>
											handleInputChange(
												'media',
												'maxUploadSize',
												parseInt(e.target.value)
											)
										}
									/>
									<SettingDescription>
										Maximum file size for uploads in megabytes
									</SettingDescription>
								</FormGroup>

								<FormGroup>
									<FormLabel htmlFor='imageQuality'>
										Image Quality (0-100)
									</FormLabel>
									<Input
										id='imageQuality'
										type='number'
										min='0'
										max='100'
										value={localSettings.media.imageQuality}
										onChange={(e) =>
											handleInputChange(
												'media',
												'imageQuality',
												parseInt(e.target.value)
											)
										}
									/>
									<SettingDescription>
										Quality setting for image compression (higher values mean
										better quality but larger files)
									</SettingDescription>
								</FormGroup>
							</Grid>

							<FormGroup>
								<FormLabel htmlFor='allowedFileTypes'>
									Allowed File Types
								</FormLabel>
								<Input
									id='allowedFileTypes'
									value={localSettings.media.allowedFileTypes.join(', ')}
									onChange={(e) =>
										handleInputChange(
											'media',
											'allowedFileTypes',
											e.target.value.split(',').map((type) => type.trim())
										)
									}
								/>
								<SettingDescription>
									Comma-separated list of allowed file extensions (e.g., jpg,
									png, pdf)
								</SettingDescription>
							</FormGroup>

							<FormGroup>
								<FormLabel htmlFor='storageProvider'>
									Storage Provider
								</FormLabel>
								<Select
									id='storageProvider'
									value={localSettings.media.storageProvider}
									onChange={(e) =>
										handleInputChange(
											'media',
											'storageProvider',
											e.target.value
										)
									}
								>
									<option value='local'>Local Storage</option>
									<option value='s3'>Amazon S3</option>
									<option value='gcs'>Google Cloud Storage</option>
									<option value='azure'>Azure Blob Storage</option>
								</Select>
								<SettingDescription>
									Provider used for storing uploaded files
								</SettingDescription>
							</FormGroup>
						</CardContent>
					</Card>
				</SettingsSection>
			)}

			{activeTab === 'features' && (
				<SettingsSection>
					<Card>
						<CardContent>
							<Grid columns={2} gap='md'>
								<FormGroup>
									<CheckboxLabel>
										<Checkbox
											type='checkbox'
											checked={localSettings.features.enableMatching}
											onChange={(e) =>
												handleInputChange(
													'features',
													'enableMatching',
													e.target.checked
												)
											}
										/>
										Enable Matching
									</CheckboxLabel>
									<SettingDescription>
										Allow users to match with other users based on their
										preferences
									</SettingDescription>
								</FormGroup>

								<FormGroup>
									<CheckboxLabel>
										<Checkbox
											type='checkbox'
											checked={localSettings.features.enableUserProfiles}
											onChange={(e) =>
												handleInputChange(
													'features',
													'enableUserProfiles',
													e.target.checked
												)
											}
										/>
										Enable User Profiles
									</CheckboxLabel>
									<SettingDescription>
										Allow users to create and customize their profiles
									</SettingDescription>
								</FormGroup>

								<FormGroup>
									<CheckboxLabel>
										<Checkbox
											type='checkbox'
											checked={localSettings.features.enableNotifications}
											onChange={(e) =>
												handleInputChange(
													'features',
													'enableNotifications',
													e.target.checked
												)
											}
										/>
										Enable Notifications
									</CheckboxLabel>
									<SettingDescription>
										Send notifications to users for important events
									</SettingDescription>
								</FormGroup>

								<FormGroup>
									<CheckboxLabel>
										<Checkbox
											type='checkbox'
											checked={localSettings.features.enableActivityFeed}
											onChange={(e) =>
												handleInputChange(
													'features',
													'enableActivityFeed',
													e.target.checked
												)
											}
										/>
										Enable Activity Feed
									</CheckboxLabel>
									<SettingDescription>
										Show users a feed of recent activities
									</SettingDescription>
								</FormGroup>
							</Grid>
						</CardContent>
					</Card>
				</SettingsSection>
			)}

			{activeTab === 'advanced' && (
				<>
					<SettingsImportExport />
					<EnvironmentOverrides />
					<SettingsAuditLog />
				</>
			)}

			<SubmitButtonContainer>
				<Flex justifyContent='flex-end' gap='md'>
					<Button variant='secondary' onClick={() => window.location.reload()}>
						Cancel
					</Button>
					<Button
						variant='primary'
						onClick={handleSaveSettings}
						disabled={isSaving}
					>
						{isSaving ? 'Saving...' : 'Save Settings'}
					</Button>
				</Flex>
			</SubmitButtonContainer>
		</SettingsContainer>
	);
};

export default AdminSettings;
