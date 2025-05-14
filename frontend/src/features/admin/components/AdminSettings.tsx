import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { Card, CardContent } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Flex, Grid } from '../../../components/common/Layout';
import { Loading } from '../../../components/common/Loading';
import { Select } from '../../../components/common/Select';
import { H1, H4, Typography } from '../../../components/common/Typography';
import { admin } from '../../../services/api';

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
	email: {
		smtpServer: string;
		smtpPort: number;
		smtpUsername: string;
		smtpPassword: string;
		senderEmail: string;
		senderName: string;
		emailTemplatesPath: string;
	};
	media: {
		maxUploadSize: number;
		allowedFileTypes: string[];
		imageQuality: number;
		storageProvider: string;
	};
	features: {
		enableMatching: boolean;
		enableUserProfiles: boolean;
		enableNotifications: boolean;
		enableActivityFeed: boolean;
	};
}

const AdminSettings: React.FC = () => {
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

				// In a real implementation, this would be an actual API call
				const response = await admin.getAppSettings();
				setSettings(response.settings);
			} catch (err) {
				setError(
					'Failed to load application settings: ' +
						(err instanceof Error ? err.message : String(err))
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSettings();
	}, []);

	const handleInputChange = (
		section: keyof AppSettings,
		key: string,
		value: any
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

	const handleNestedInputChange = (
		section: keyof AppSettings,
		parentKey: string,
		key: string,
		value: any
	) => {
		if (!settings) return;

		// Use a type assertion to ensure TypeScript understands the structure
		setSettings({
			...settings,
			[section]: {
				...settings[section],
				[parentKey]: {
					// Use a type assertion to tell TypeScript this is a safe object to spread
					...(settings[section] as any)[parentKey],
					[key]: value,
				},
			},
		});
	};

	const handleSaveSettings = async () => {
		if (!settings) return;

		try {
			setIsSaving(true);
			setError(null);
			setSuccessMessage(null);

			// In a real implementation, this would be an actual API call
			await admin.updateAppSettings(settings);

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

	if (isLoading) {
		return <Loading message='Loading application settings...' />;
	}

	if (!settings) {
		return <Typography>No settings available</Typography>;
	}

	return (
		<SettingsContainer>
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

			<SettingsSection>
				<SectionTitle>General Settings</SectionTitle>
				<Card>
					<CardContent>
						<Grid columns={2} gap='md'>
							<FormGroup>
								<FormLabel htmlFor='siteName'>Site Name</FormLabel>
								<Input
									id='siteName'
									value={settings.general.siteName}
									onChange={(e) =>
										handleInputChange('general', 'siteName', e.target.value)
									}
								/>
								<SettingDescription>
									The name of your application that appears in the browser title
									and emails
								</SettingDescription>
							</FormGroup>

							<FormGroup>
								<FormLabel htmlFor='siteDescription'>
									Site Description
								</FormLabel>
								<Input
									id='siteDescription'
									value={settings.general.siteDescription}
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
									value={settings.general.defaultUserRole}
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
										checked={settings.general.maintenanceMode}
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

			<SettingsSection>
				<SectionTitle>Security Settings</SectionTitle>
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
									value={settings.security.sessionTimeout}
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
									value={settings.security.maxLoginAttempts}
									onChange={(e) =>
										handleInputChange(
											'security',
											'maxLoginAttempts',
											parseInt(e.target.value)
										)
									}
								/>
								<SettingDescription>
									Number of failed login attempts before account is temporarily
									locked
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
									value={settings.security.passwordPolicy.minLength}
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
										checked={settings.security.passwordPolicy.requireUppercase}
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
										checked={settings.security.passwordPolicy.requireLowercase}
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
										checked={settings.security.passwordPolicy.requireNumbers}
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
											settings.security.passwordPolicy.requireSpecialChars
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
										checked={settings.security.twoFactorAuth.enabled}
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
										checked={settings.security.twoFactorAuth.requiredForAdmins}
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

			<SettingsSection>
				<SectionTitle>Feature Toggles</SectionTitle>
				<Card>
					<CardContent>
						<Grid columns={2} gap='md'>
							<FormGroup>
								<CheckboxLabel>
									<Checkbox
										type='checkbox'
										checked={settings.features.enableMatching}
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
										checked={settings.features.enableUserProfiles}
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
										checked={settings.features.enableNotifications}
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
										checked={settings.features.enableActivityFeed}
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
