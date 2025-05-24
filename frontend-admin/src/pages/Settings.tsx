import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { H1 } from '../components/common/Typography';
import { admin } from '../services/api';

const SettingsContainer = styled.div`
	max-width: 800px;
`;

const Section = styled.section`
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border-radius: ${({ theme }) => theme.borderRadius.md};
	padding: ${({ theme }) => theme.spacing.lg};
	margin-bottom: ${({ theme }) => theme.spacing.lg};
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
	margin: 0 0 ${({ theme }) => theme.spacing.md};
	font-size: 1.25rem;
`;

const FormGroup = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Label = styled.label`
	display: block;
	margin-bottom: ${({ theme }) => theme.spacing.xs};
	font-weight: 500;
`;

const Input = styled.input`
	width: 100%;
	padding: ${({ theme }) => theme.spacing.sm};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	background-color: ${({ theme }) => theme.colors.background.primary};
	color: ${({ theme }) => theme.colors.text.primary};

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.primary.main};
		box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light};
	}
`;

const Select = styled.select`
	width: 100%;
	padding: ${({ theme }) => theme.spacing.sm};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	background-color: ${({ theme }) => theme.colors.background.primary};
	color: ${({ theme }) => theme.colors.text.primary};

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.primary.main};
		box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light};
	}
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
	margin-right: ${({ theme }) => theme.spacing.xs};
`;

const ButtonContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: ${({ theme }) => theme.spacing.sm};
	margin-top: ${({ theme }) => theme.spacing.lg};
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

				const response = await admin.getAppSettings();
				setSettings(response.settings);
			} catch (err) {
				console.error('Error fetching settings:', err);
				setError('Failed to fetch application settings. Please try again.');
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

			await admin.updateAppSettings(settings);
			setSuccessMessage('Settings saved successfully!');

			// Clear success message after 3 seconds
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (err) {
			console.error('Error saving settings:', err);
			setError('Failed to save settings. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleChange = (
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

	const handlePasswordPolicyChange = (key: string, value: any) => {
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

	if (isLoading) return <Loading message='Loading settings...' />;
	if (!settings) return <div>No settings available.</div>;

	return (
		<SettingsContainer>
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

			<Section>
				<SectionTitle>General Settings</SectionTitle>
				<FormGroup>
					<Label>Site Name</Label>
					<Input
						value={settings.general.siteName}
						onChange={(e) =>
							handleChange('general', 'siteName', e.target.value)
						}
					/>
				</FormGroup>
				<FormGroup>
					<Label>Site Description</Label>
					<Input
						value={settings.general.siteDescription}
						onChange={(e) =>
							handleChange('general', 'siteDescription', e.target.value)
						}
					/>
				</FormGroup>
				<FormGroup>
					<Label>
						<Checkbox
							checked={settings.general.maintenanceMode}
							onChange={(e) =>
								handleChange('general', 'maintenanceMode', e.target.checked)
							}
						/>
						Maintenance Mode
					</Label>
				</FormGroup>
				<FormGroup>
					<Label>Default User Role</Label>
					<Select
						value={settings.general.defaultUserRole}
						onChange={(e) =>
							handleChange('general', 'defaultUserRole', e.target.value)
						}
					>
						<option value='user'>User</option>
						<option value='moderator'>Moderator</option>
					</Select>
				</FormGroup>
			</Section>

			<Section>
				<SectionTitle>Security Settings</SectionTitle>
				<FormGroup>
					<Label>Session Timeout (minutes)</Label>
					<Input
						type='number'
						value={settings.security.sessionTimeout}
						onChange={(e) =>
							handleChange(
								'security',
								'sessionTimeout',
								parseInt(e.target.value)
							)
						}
					/>
				</FormGroup>
				<FormGroup>
					<Label>Max Login Attempts</Label>
					<Input
						type='number'
						value={settings.security.maxLoginAttempts}
						onChange={(e) =>
							handleChange(
								'security',
								'maxLoginAttempts',
								parseInt(e.target.value)
							)
						}
					/>
				</FormGroup>

				<SectionTitle>Password Policy</SectionTitle>
				<FormGroup>
					<Label>Minimum Length</Label>
					<Input
						type='number'
						value={settings.security.passwordPolicy.minLength}
						onChange={(e) =>
							handlePasswordPolicyChange('minLength', parseInt(e.target.value))
						}
					/>
				</FormGroup>
				<FormGroup>
					<Label>
						<Checkbox
							checked={settings.security.passwordPolicy.requireUppercase}
							onChange={(e) =>
								handlePasswordPolicyChange('requireUppercase', e.target.checked)
							}
						/>
						Require Uppercase Letters
					</Label>
				</FormGroup>
				<FormGroup>
					<Label>
						<Checkbox
							checked={settings.security.passwordPolicy.requireLowercase}
							onChange={(e) =>
								handlePasswordPolicyChange('requireLowercase', e.target.checked)
							}
						/>
						Require Lowercase Letters
					</Label>
				</FormGroup>
				<FormGroup>
					<Label>
						<Checkbox
							checked={settings.security.passwordPolicy.requireNumbers}
							onChange={(e) =>
								handlePasswordPolicyChange('requireNumbers', e.target.checked)
							}
						/>
						Require Numbers
					</Label>
				</FormGroup>
				<FormGroup>
					<Label>
						<Checkbox
							checked={settings.security.passwordPolicy.requireSpecialChars}
							onChange={(e) =>
								handlePasswordPolicyChange(
									'requireSpecialChars',
									e.target.checked
								)
							}
						/>
						Require Special Characters
					</Label>
				</FormGroup>
			</Section>

			<Section>
				<SectionTitle>Feature Flags</SectionTitle>
				<FormGroup>
					<Label>
						<Checkbox
							checked={settings.features.enableMatching}
							onChange={(e) =>
								handleChange('features', 'enableMatching', e.target.checked)
							}
						/>
						Enable Matching
					</Label>
				</FormGroup>
				<FormGroup>
					<Label>
						<Checkbox
							checked={settings.features.enableUserProfiles}
							onChange={(e) =>
								handleChange('features', 'enableUserProfiles', e.target.checked)
							}
						/>
						Enable User Profiles
					</Label>
				</FormGroup>
				<FormGroup>
					<Label>
						<Checkbox
							checked={settings.features.enableNotifications}
							onChange={(e) =>
								handleChange(
									'features',
									'enableNotifications',
									e.target.checked
								)
							}
						/>
						Enable Notifications
					</Label>
				</FormGroup>
				<FormGroup>
					<Label>
						<Checkbox
							checked={settings.features.enableActivityFeed}
							onChange={(e) =>
								handleChange('features', 'enableActivityFeed', e.target.checked)
							}
						/>
						Enable Activity Feed
					</Label>
				</FormGroup>
			</Section>

			<ButtonContainer>
				<Button variant='primary' onClick={handleSave} disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Save Changes'}
				</Button>
			</ButtonContainer>
		</SettingsContainer>
	);
};

export default Settings;
