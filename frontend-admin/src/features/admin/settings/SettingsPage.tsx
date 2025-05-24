import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AppSettings, adminService } from '../../../services/admin.service';

// Styled components
const PageContainer = styled.div`
	padding-bottom: 2rem;
`;

const PageHeader = styled.div`
	margin-bottom: 2rem;
`;

const H1 = styled.h1`
	color: #ffffff;
	margin-bottom: 0.5rem;
	font-size: 2rem;
`;

const SubHeading = styled.p`
	color: #b3b3b3;
	margin-bottom: 2rem;
	font-size: 1rem;
`;

const SettingsCard = styled.div`
	background-color: #1e1e1e;
	border-radius: 0.5rem;
	padding: 1.5rem;
	margin-bottom: 1.5rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SettingCardHeader = styled.h2`
	color: #ffffff;
	margin-top: 0;
	margin-bottom: 1.5rem;
	font-size: 1.25rem;
	border-bottom: 1px solid #333;
	padding-bottom: 0.5rem;
`;

const FormGroup = styled.div`
	margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
	display: block;
	margin-bottom: 0.5rem;
	color: #e0e0e0;
	font-weight: 500;
`;

const FormInput = styled.input`
	width: 100%;
	padding: 0.75rem 1rem;
	border-radius: 0.25rem;
	border: 1px solid #333;
	background-color: #333;
	color: #e0e0e0;

	&:focus {
		outline: none;
		box-shadow: 0 0 0 2px #2196f380;
	}
`;

const FormSelect = styled.select`
	width: 100%;
	padding: 0.75rem 1rem;
	border-radius: 0.25rem;
	border: 1px solid #333;
	background-color: #333;
	color: #e0e0e0;

	&:focus {
		outline: none;
		box-shadow: 0 0 0 2px #2196f380;
	}
`;

const FormCheckboxLabel = styled.label`
	display: flex;
	align-items: center;
	margin-bottom: 0.5rem;
	color: #e0e0e0;
	cursor: pointer;
`;

const FormCheckbox = styled.input`
	margin-right: 0.5rem;
	cursor: pointer;
`;

const FormDescription = styled.p`
	color: #999;
	font-size: 0.875rem;
	margin-top: 0.25rem;
`;

const ButtonGroup = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 1rem;
	margin-top: 2rem;
`;

const Button = styled.button`
	padding: 0.75rem 1.5rem;
	border-radius: 0.25rem;
	border: none;
	background-color: #2196f3;
	color: white;
	cursor: pointer;
	transition: background-color 0.2s;

	&:hover {
		background-color: #1976d2;
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 2px #2196f380;
	}

	&:disabled {
		background-color: #666;
		cursor: not-allowed;
	}
`;

const SecondaryButton = styled(Button)`
	background-color: #424242;

	&:hover {
		background-color: #616161;
	}
`;

const TabsContainer = styled.div`
	display: flex;
	border-bottom: 1px solid #333;
	margin-bottom: 2rem;
	overflow-x: auto;
`;

const Tab = styled.button<{ active: boolean }>`
	padding: 0.75rem 1.5rem;
	background-color: ${(props) => (props.active ? '#2196f3' : 'transparent')};
	color: ${(props) => (props.active ? 'white' : '#b3b3b3')};
	border: none;
	cursor: pointer;
	transition: all 0.2s;
	border-bottom: 2px solid
		${(props) => (props.active ? '#2196f3' : 'transparent')};

	&:hover {
		background-color: ${(props) => (props.active ? '#2196f3' : '#333')};
	}
`;

const Alert = styled.div<{ type: 'success' | 'error' }>`
	padding: 1rem;
	margin-bottom: 1rem;
	background-color: ${(props) =>
		props.type === 'success' ? '#4caf5033' : '#f4433633'};
	color: ${(props) => (props.type === 'success' ? '#4caf50' : '#f44336')};
	border-radius: 0.25rem;
	border-left: 4px solid
		${(props) => (props.type === 'success' ? '#4caf50' : '#f44336')};
`;

const FormGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 1.5rem;
`;

export const SettingsPage: React.FC = () => {
	const [settings, setSettings] = useState<AppSettings | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState('general');

	// Load settings on component mount
	useEffect(() => {
		fetchSettings();
	}, []);

	const fetchSettings = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await adminService.getAppSettings();
			setSettings(response.settings);
		} catch (err) {
			setError(
				`Failed to load settings: ${err instanceof Error ? err.message : String(err)}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSaveSettings = async () => {
		if (!settings) return;

		try {
			setIsSaving(true);
			setError(null);
			setSuccessMessage(null);

			const response = await adminService.updateAppSettings(settings);
			setSettings(response.settings);
			setSuccessMessage('Settings saved successfully!');

			// Clear success message after 3 seconds
			setTimeout(() => {
				setSuccessMessage(null);
			}, 3000);
		} catch (err) {
			setError(
				`Failed to save settings: ${err instanceof Error ? err.message : String(err)}`
			);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancelChanges = () => {
		fetchSettings();
	};

	// Handle input changes for nested settings
	const handleInputChange = (
		section: keyof AppSettings,
		field: string,
		value: any
	) => {
		if (!settings) return;

		setSettings({
			...settings,
			[section]: {
				...settings[section],
				[field]: value,
			},
		});
	};

	// Handle input changes for deeply nested settings
	const handleNestedInputChange = (
		section: keyof AppSettings,
		subSection: string,
		field: string,
		value: any
	) => {
		if (!settings) return;

		setSettings({
			...settings,
			[section]: {
				...settings[section],
				[subSection]: {
					...(settings[section] as any)[subSection],
					[field]: value,
				},
			},
		});
	};

	if (isLoading) {
		return <p>Loading settings...</p>;
	}

	if (!settings) {
		return <p>No settings found.</p>;
	}

	return (
		<PageContainer>
			<PageHeader>
				<H1>System Settings</H1>
				<SubHeading>Configure application settings and preferences</SubHeading>
			</PageHeader>

			{error && <Alert type='error'>{error}</Alert>}

			{successMessage && <Alert type='success'>{successMessage}</Alert>}

			<TabsContainer>
				<Tab
					active={activeTab === 'general'}
					onClick={() => setActiveTab('general')}
				>
					General
				</Tab>
				<Tab
					active={activeTab === 'security'}
					onClick={() => setActiveTab('security')}
				>
					Security
				</Tab>
				<Tab
					active={activeTab === 'email'}
					onClick={() => setActiveTab('email')}
				>
					Email
				</Tab>
				<Tab
					active={activeTab === 'features'}
					onClick={() => setActiveTab('features')}
				>
					Feature Toggles
				</Tab>
			</TabsContainer>

			{activeTab === 'general' && (
				<SettingsCard>
					<SettingCardHeader>General Settings</SettingCardHeader>

					<FormGrid>
						<FormGroup>
							<FormLabel htmlFor='siteName'>Site Name</FormLabel>
							<FormInput
								id='siteName'
								type='text'
								value={settings.general.siteName}
								onChange={(e) =>
									handleInputChange('general', 'siteName', e.target.value)
								}
							/>
							<FormDescription>
								The name of your site that appears in the browser tab and emails
							</FormDescription>
						</FormGroup>

						<FormGroup>
							<FormLabel htmlFor='siteDescription'>Site Description</FormLabel>
							<FormInput
								id='siteDescription'
								type='text'
								value={settings.general.siteDescription}
								onChange={(e) =>
									handleInputChange(
										'general',
										'siteDescription',
										e.target.value
									)
								}
							/>
							<FormDescription>
								A brief description of your site for SEO and sharing
							</FormDescription>
						</FormGroup>

						<FormGroup>
							<FormLabel htmlFor='defaultUserRole'>Default User Role</FormLabel>
							<FormSelect
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
							</FormSelect>
							<FormDescription>
								The default role assigned to new users
							</FormDescription>
						</FormGroup>

						<FormGroup>
							<FormCheckboxLabel>
								<FormCheckbox
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
							</FormCheckboxLabel>
							<FormDescription>
								When enabled, only administrators can access the site
							</FormDescription>
						</FormGroup>
					</FormGrid>
				</SettingsCard>
			)}

			{activeTab === 'security' && (
				<SettingsCard>
					<SettingCardHeader>Security Settings</SettingCardHeader>

					<FormGrid>
						<FormGroup>
							<FormLabel htmlFor='sessionTimeout'>
								Session Timeout (minutes)
							</FormLabel>
							<FormInput
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
								min='5'
							/>
							<FormDescription>
								How long a user session remains active before requiring re-login
							</FormDescription>
						</FormGroup>

						<FormGroup>
							<FormLabel htmlFor='maxLoginAttempts'>
								Max Login Attempts
							</FormLabel>
							<FormInput
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
								min='1'
							/>
							<FormDescription>
								Number of failed login attempts before temporary lockout
							</FormDescription>
						</FormGroup>

						<FormGroup>
							<FormLabel>Password Policy</FormLabel>

							<FormCheckboxLabel>
								<FormCheckbox
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
								Require Uppercase
							</FormCheckboxLabel>

							<FormCheckboxLabel>
								<FormCheckbox
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
								Require Lowercase
							</FormCheckboxLabel>

							<FormCheckboxLabel>
								<FormCheckbox
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
							</FormCheckboxLabel>

							<FormCheckboxLabel>
								<FormCheckbox
									type='checkbox'
									checked={settings.security.passwordPolicy.requireSpecialChars}
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
							</FormCheckboxLabel>
						</FormGroup>

						<FormGroup>
							<FormLabel htmlFor='minLength'>Minimum Password Length</FormLabel>
							<FormInput
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
								min='6'
							/>
							<FormDescription>
								Minimum number of characters required for passwords
							</FormDescription>
						</FormGroup>
					</FormGrid>

					<FormGroup>
						<FormCheckboxLabel>
							<FormCheckbox
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
						</FormCheckboxLabel>
						<FormDescription>
							Allow users to set up two-factor authentication for their accounts
						</FormDescription>
					</FormGroup>

					<FormGroup>
						<FormCheckboxLabel>
							<FormCheckbox
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
						</FormCheckboxLabel>
						<FormDescription>
							Force all administrator accounts to use two-factor authentication
						</FormDescription>
					</FormGroup>
				</SettingsCard>
			)}

			{activeTab === 'email' && (
				<SettingsCard>
					<SettingCardHeader>Email Settings</SettingCardHeader>

					<FormGrid>
						<FormGroup>
							<FormLabel htmlFor='smtpServer'>SMTP Server</FormLabel>
							<FormInput
								id='smtpServer'
								type='text'
								value={settings.email.smtpServer}
								onChange={(e) =>
									handleInputChange('email', 'smtpServer', e.target.value)
								}
							/>
						</FormGroup>

						<FormGroup>
							<FormLabel htmlFor='smtpPort'>SMTP Port</FormLabel>
							<FormInput
								id='smtpPort'
								type='number'
								value={settings.email.smtpPort}
								onChange={(e) =>
									handleInputChange(
										'email',
										'smtpPort',
										parseInt(e.target.value)
									)
								}
							/>
						</FormGroup>

						<FormGroup>
							<FormLabel htmlFor='smtpUsername'>SMTP Username</FormLabel>
							<FormInput
								id='smtpUsername'
								type='text'
								value={settings.email.smtpUsername}
								onChange={(e) =>
									handleInputChange('email', 'smtpUsername', e.target.value)
								}
							/>
						</FormGroup>

						<FormGroup>
							<FormLabel htmlFor='smtpPassword'>SMTP Password</FormLabel>
							<FormInput
								id='smtpPassword'
								type='password'
								value={settings.email.smtpPassword}
								onChange={(e) =>
									handleInputChange('email', 'smtpPassword', e.target.value)
								}
							/>
						</FormGroup>

						<FormGroup>
							<FormLabel htmlFor='senderEmail'>Sender Email</FormLabel>
							<FormInput
								id='senderEmail'
								type='email'
								value={settings.email.senderEmail}
								onChange={(e) =>
									handleInputChange('email', 'senderEmail', e.target.value)
								}
							/>
							<FormDescription>
								The email address that will appear as the sender
							</FormDescription>
						</FormGroup>

						<FormGroup>
							<FormLabel htmlFor='senderName'>Sender Name</FormLabel>
							<FormInput
								id='senderName'
								type='text'
								value={settings.email.senderName}
								onChange={(e) =>
									handleInputChange('email', 'senderName', e.target.value)
								}
							/>
							<FormDescription>
								The name that will appear as the sender
							</FormDescription>
						</FormGroup>
					</FormGrid>
				</SettingsCard>
			)}

			{activeTab === 'features' && (
				<SettingsCard>
					<SettingCardHeader>Feature Toggles</SettingCardHeader>

					<FormGroup>
						<FormCheckboxLabel>
							<FormCheckbox
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
						</FormCheckboxLabel>
						<FormDescription>
							Allow users to match content with other users
						</FormDescription>
					</FormGroup>

					<FormGroup>
						<FormCheckboxLabel>
							<FormCheckbox
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
						</FormCheckboxLabel>
						<FormDescription>
							Allow users to customize their profile information
						</FormDescription>
					</FormGroup>

					<FormGroup>
						<FormCheckboxLabel>
							<FormCheckbox
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
						</FormCheckboxLabel>
						<FormDescription>
							Send email and in-app notifications to users
						</FormDescription>
					</FormGroup>

					<FormGroup>
						<FormCheckboxLabel>
							<FormCheckbox
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
						</FormCheckboxLabel>
						<FormDescription>
							Show users an activity feed of recent actions
						</FormDescription>
					</FormGroup>
				</SettingsCard>
			)}

			<ButtonGroup>
				<SecondaryButton onClick={handleCancelChanges}>
					Cancel Changes
				</SecondaryButton>
				<Button onClick={handleSaveSettings} disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Save Settings'}
				</Button>
			</ButtonGroup>
		</PageContainer>
	);
};
