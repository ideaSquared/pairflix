import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../../components/layout/Layout';
import { user } from '../../services/api';

const ProfileContainer = styled.div`
	max-width: 600px;
	margin: 0 auto;
`;

const Form = styled.form`
	background: #1a1a1a;
	padding: 2rem;
	border-radius: 8px;
	margin-bottom: 2rem;
`;

const Input = styled.input`
	width: 100%;
	padding: 0.5rem;
	margin-bottom: 1rem;
	background: #2a2a2a;
	border: 1px solid #3a3a3a;
	border-radius: 4px;
	color: white;
`;

const Button = styled.button`
	width: 100%;
	padding: 0.5rem;
	background: #646cff;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	&:hover {
		background: #747bff;
	}
	&:disabled {
		background: #4a4a4a;
		cursor: not-allowed;
	}
`;

const ErrorMessage = styled.div`
	color: #ff4444;
	margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
	color: #00ff00;
	margin-bottom: 1rem;
`;

const ProfilePage: React.FC = () => {
	// Password update state
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [passwordSuccess, setPasswordSuccess] = useState('');

	// Email update state
	const [newEmail, setNewEmail] = useState('');
	const [emailPassword, setEmailPassword] = useState('');
	const [emailError, setEmailError] = useState('');
	const [emailSuccess, setEmailSuccess] = useState('');

	// Username update state
	const [newUsername, setNewUsername] = useState('');
	const [usernamePassword, setUsernamePassword] = useState('');
	const [usernameError, setUsernameError] = useState('');
	const [usernameSuccess, setUsernameSuccess] = useState('');

	const passwordMutation = useMutation(user.updatePassword, {
		onSuccess: () => {
			setPasswordSuccess('Password updated successfully');
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			setPasswordError('');
		},
		onError: (error: Error) => {
			setPasswordError(error.message);
			setPasswordSuccess('');
		},
	});

	const emailMutation = useMutation(user.updateEmail, {
		onSuccess: () => {
			setEmailSuccess('Email updated successfully');
			setNewEmail('');
			setEmailPassword('');
			setEmailError('');
		},
		onError: (error: Error) => {
			setEmailError(error.message);
			setEmailSuccess('');
		},
	});

	const usernameMutation = useMutation(user.updateUsername, {
		onSuccess: () => {
			setUsernameSuccess('Username updated successfully');
			setNewUsername('');
			setUsernamePassword('');
			setUsernameError('');
		},
		onError: (error: Error) => {
			setUsernameError(error.message);
			setUsernameSuccess('');
		},
	});

	const handlePasswordUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		setPasswordError('');
		setPasswordSuccess('');

		if (newPassword !== confirmPassword) {
			setPasswordError('New passwords do not match');
			return;
		}

		if (newPassword.length < 8) {
			setPasswordError('Password must be at least 8 characters long');
			return;
		}

		passwordMutation.mutate({
			currentPassword,
			newPassword,
		});
	};

	const handleEmailUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		setEmailError('');
		setEmailSuccess('');

		if (!newEmail.includes('@')) {
			setEmailError('Please enter a valid email address');
			return;
		}

		emailMutation.mutate({
			email: newEmail,
			password: emailPassword,
		});
	};

	const handleUsernameUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		setUsernameError('');
		setUsernameSuccess('');

		if (!/^[a-zA-Z0-9_-]{3,30}$/.test(newUsername)) {
			setUsernameError('Username must be 3-30 characters and contain only letters, numbers, underscore, or hyphen');
			return;
		}

		usernameMutation.mutate({
			username: newUsername,
			password: usernamePassword,
		});
	};

	return (
		<Layout>
			<ProfileContainer>
				<h1>Profile Settings</h1>

				<Form onSubmit={handleUsernameUpdate}>
					<h2>Change Username</h2>
					{usernameError && <ErrorMessage>{usernameError}</ErrorMessage>}
					{usernameSuccess && <SuccessMessage>{usernameSuccess}</SuccessMessage>}
					<Input
						type="text"
						placeholder="New Username"
						value={newUsername}
						onChange={(e) => setNewUsername(e.target.value)}
						required
					/>
					<Input
						type="password"
						placeholder="Current Password"
						value={usernamePassword}
						onChange={(e) => setUsernamePassword(e.target.value)}
						required
					/>
					<Button type="submit" disabled={usernameMutation.isLoading}>
						Update Username
					</Button>
				</Form>

				<Form onSubmit={handleEmailUpdate}>
					<h2>Change Email</h2>
					{emailError && <ErrorMessage>{emailError}</ErrorMessage>}
					{emailSuccess && <SuccessMessage>{emailSuccess}</SuccessMessage>}
					<Input
						type="email"
						placeholder="New Email"
						value={newEmail}
						onChange={(e) => setNewEmail(e.target.value)}
						required
					/>
					<Input
						type="password"
						placeholder="Current Password"
						value={emailPassword}
						onChange={(e) => setEmailPassword(e.target.value)}
						required
					/>
					<Button type="submit" disabled={emailMutation.isLoading}>
						Update Email
					</Button>
				</Form>

				<Form onSubmit={handlePasswordUpdate}>
					<h2>Change Password</h2>
					{passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
					{passwordSuccess && <SuccessMessage>{passwordSuccess}</SuccessMessage>}
					<Input
						type="password"
						placeholder="Current Password"
						value={currentPassword}
						onChange={(e) => setCurrentPassword(e.target.value)}
						required
					/>
					<Input
						type="password"
						placeholder="New Password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						required
					/>
					<Input
						type="password"
						placeholder="Confirm New Password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
					/>
					<Button type="submit" disabled={passwordMutation.isLoading}>
						Update Password
					</Button>
				</Form>
			</ProfileContainer>
		</Layout>
	);
};

export default ProfilePage;
