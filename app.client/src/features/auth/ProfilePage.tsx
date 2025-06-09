import {
  Button,
  Card,
  CardContent,
  H1,
  H2,
  Input,
  Select,
  Typography,
} from '@pairflix/components';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import DocumentTitle from '../../components/common/DocumentTitle';
import Layout from '../../components/layout/Layout';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../hooks/useAuth';
import { user as userService } from '../../services/api';
import { validatePassword } from '../../utils/passwordPolicy';
// Define response types for API calls
type ApiResponse = {
  token: string;
  message?: string;
  user?: {
    preferences?: UserPreferences;
    [key: string]: unknown;
  };
};

type UserPreferences = {
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  autoArchiveDays: number;
  favoriteGenres: string[];
  viewStyle?: 'grid' | 'list';
  [key: string]: unknown;
};

const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.md};
`;

// Create proper interfaces for our custom card components
interface StandardCardProps {
  variant?: 'primary' | 'secondary' | 'outlined';
  children: React.ReactNode;
  className?: string;
  elevation?: 'low' | 'medium' | 'high';
  accentColor?: string;
  interactive?: boolean;
}

const UserInfo = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

const Label = styled(Typography)`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Value = styled(Typography)`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const StyledForm = styled.form`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FormCard = styled(Card).attrs<StandardCardProps>(props => ({
  variant: props.variant || 'secondary',
}))<StandardCardProps>`
  > div {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }

  button {
    margin-top: ${({ theme }) => theme.spacing.sm};
  }
`;

const PreferencesCard = styled(Card).attrs<StandardCardProps>(props => ({
  variant: props.variant || 'secondary',
}))<StandardCardProps>`
  .preference-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({ theme }) => theme.spacing.sm} 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    &:last-child {
      border-bottom: none;
    }

    select {
      width: 150px;
    }
  }
`;

const ErrorMessage = styled(Typography)`
  color: ${({ theme }) => theme.colors.text.error};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SuccessMessage = styled(Typography)`
  color: ${({ theme }) => theme.colors.text.success};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 52px;
  height: 26px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.colors.background.secondary};
    transition: 0.3s;
    border-radius: 26px;
    border: 1px solid ${({ theme }) => theme.colors.border};

    &:before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: ${({ theme }) => theme.colors.text.secondary};
      transition: 0.3s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }

  input:checked + span:before {
    background-color: ${({ theme }) => theme.colors.text.primary};
    transform: translateX(26px);
  }

  &:hover span:before {
    box-shadow: 0 0 2px ${({ theme }) => theme.colors.primary};
  }
`;

const ProfilePage: React.FC = () => {
  const { user, checkAuth, logout } = useAuth();
  const { settings } = useSettings();

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
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');

  const [preferenceSuccess, setPreferenceSuccess] = useState('');
  const [preferenceError, setPreferenceError] = useState('');

  useEffect(() => {
    if (!user) {
      logout();
      return;
    }
  }, [user, logout]);

  const handleAuthError = (error: Error) => {
    if (
      error.message === 'Authentication required' ||
      error.message === 'Session expired. Please login again.' ||
      error.message === 'Invalid or expired token'
    ) {
      logout();
      return;
    }
  };

  const passwordMutation = useMutation<
    ApiResponse,
    Error,
    { currentPassword: string; newPassword: string }
  >({
    mutationFn: data => userService.updatePassword(data),
    onSuccess: response => {
      setPasswordSuccess('Password updated successfully');
      setPasswordError('');
      if (response.token) {
        localStorage.setItem('token', response.token);
        checkAuth();
      }
    },
    onError: (error: Error) => {
      setPasswordError(error.message);
      setPasswordSuccess('');
      handleAuthError(error);
    },
  });

  const emailMutation = useMutation<
    ApiResponse,
    Error,
    { email: string; password: string }
  >({
    mutationFn: data => userService.updateEmail(data),
    onSuccess: response => {
      setEmailSuccess('Email updated successfully');
      setEmailError('');
      if (response.token) {
        localStorage.setItem('token', response.token);
        checkAuth();
      }
    },
    onError: (error: Error) => {
      setEmailError(error.message);
      setEmailSuccess('');
      handleAuthError(error);
    },
  });

  const usernameMutation = useMutation<
    ApiResponse,
    Error,
    { username: string }
  >({
    mutationFn: data => userService.updateUsername(data),
    onSuccess: response => {
      setUsernameSuccess('Username updated successfully');
      setUsernameError('');
      if (response.token) {
        localStorage.setItem('token', response.token);
        checkAuth();
      }
    },
    onError: (error: Error) => {
      setUsernameError(error.message);
      setUsernameSuccess('');
      handleAuthError(error);
    },
  });

  const preferenceMutation = useMutation<
    ApiResponse,
    Error,
    Partial<UserPreferences>
  >({
    mutationFn: data => userService.updatePreferences(data),
    onSuccess: response => {
      setPreferenceSuccess('Preferences updated successfully');
      setPreferenceError('');
      if (response.token) {
        localStorage.setItem('token', response.token);
        checkAuth();
      }
    },
    onError: (error: Error) => {
      setPreferenceError(error.message);
      setPreferenceSuccess('');
      handleAuthError(error);
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

    // If we have password policy settings, validate the new password against them
    if (settings?.security.passwordPolicy) {
      const validationResult = validatePassword(
        newPassword,
        settings.security.passwordPolicy
      );

      if (!validationResult.isValid) {
        setPasswordError(validationResult.errors[0]); // Show only the first error
        return;
      }
    } else {
      // Fallback to basic validation if settings aren't available
      if (newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters long');
        return;
      }
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
      setUsernameError(
        'Username must be 3-30 characters and contain only letters, numbers, underscore, or hyphen'
      );
      return;
    }

    usernameMutation.mutate({
      username: newUsername,
    });
  };

  const handlePreferenceUpdate = async (
    key: keyof UserPreferences,
    value: unknown
  ) => {
    if (!user) return;
    setPreferenceError('');
    setPreferenceSuccess('');

    try {
      const response = await preferenceMutation.mutateAsync({
        [key]: value,
      });

      // Update the stored token and auth state
      if (response.token) {
        localStorage.setItem('token', response.token);
        checkAuth();
      }

      setPreferenceSuccess('Preferences updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        setPreferenceError(error.message);
        handleAuthError(error);
      }
    }
  };

  return (
    <Layout>
      <DocumentTitle title="Profile Settings" />
      <ProfileContainer>
        <H1 gutterBottom>Profile Settings</H1>

        <FormCard variant="secondary">
          <CardContent>
            <H2 gutterBottom>Current Profile</H2>
            <UserInfo>
              <Label>Username:</Label>
              <Value>{user?.username}</Value>
              <Label>Email:</Label>
              <Value>{user?.email}</Value>
            </UserInfo>
          </CardContent>
        </FormCard>

        <StyledForm onSubmit={handleUsernameUpdate}>
          <FormCard variant="secondary">
            <CardContent>
              <H2 gutterBottom>Change Username</H2>
              {usernameError && <ErrorMessage>{usernameError}</ErrorMessage>}
              {usernameSuccess && (
                <SuccessMessage>{usernameSuccess}</SuccessMessage>
              )}
              <Input
                type="text"
                placeholder="New Username"
                value={newUsername}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewUsername(e.target.value)
                }
                required
                isFullWidth
              />
              <Button
                type="submit"
                disabled={usernameMutation.isLoading}
                isFullWidth
              >
                Update Username
              </Button>
            </CardContent>
          </FormCard>
        </StyledForm>

        <StyledForm onSubmit={handleEmailUpdate}>
          <FormCard variant="secondary">
            <CardContent>
              <H2 gutterBottom>Change Email</H2>
              {emailError && <ErrorMessage>{emailError}</ErrorMessage>}
              {emailSuccess && <SuccessMessage>{emailSuccess}</SuccessMessage>}
              <Input
                type="email"
                placeholder="New Email"
                value={newEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewEmail(e.target.value)
                }
                required
                isFullWidth
              />
              <Input
                type="password"
                placeholder="Current Password"
                value={emailPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmailPassword(e.target.value)
                }
                required
                isFullWidth
              />
              <Button
                type="submit"
                disabled={emailMutation.isLoading}
                isFullWidth
              >
                Update Email
              </Button>
            </CardContent>
          </FormCard>
        </StyledForm>

        <StyledForm onSubmit={handlePasswordUpdate}>
          <FormCard variant="secondary">
            <CardContent>
              <H2 gutterBottom>Change Password</H2>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Password must be at least 8 characters long{'\n'}
                Password must contain at least one uppercase letter{'\n'}
                Password must contain at least one number
              </Typography>
              {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
              {passwordSuccess && (
                <SuccessMessage>{passwordSuccess}</SuccessMessage>
              )}
              <Input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentPassword(e.target.value)
                }
                required
                isFullWidth
              />
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewPassword(e.target.value)
                }
                required
                isFullWidth
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                required
                isFullWidth
              />
              <Button
                type="submit"
                disabled={passwordMutation.isLoading}
                isFullWidth
              >
                Update Password
              </Button>
            </CardContent>
          </FormCard>
        </StyledForm>

        <PreferencesCard variant="secondary">
          <CardContent>
            <H2 gutterBottom>Preferences</H2>
            {preferenceError && <ErrorMessage>{preferenceError}</ErrorMessage>}
            {preferenceSuccess && (
              <SuccessMessage>{preferenceSuccess}</SuccessMessage>
            )}
            <div className="preference-row">
              <Label>Theme</Label>
              <Select
                value={user?.preferences?.theme || 'dark'}
                onChange={e =>
                  handlePreferenceUpdate(
                    'theme',
                    e.target.value as 'light' | 'dark'
                  )
                }
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
              </Select>
            </div>

            <div className="preference-row">
              <Label>Email Notifications</Label>
              <Switch>
                <input
                  type="checkbox"
                  checked={user?.preferences?.emailNotifications ?? true}
                  onChange={e =>
                    handlePreferenceUpdate(
                      'emailNotifications',
                      e.target.checked
                    )
                  }
                />
                <span />
              </Switch>
            </div>

            <div className="preference-row">
              <Label>Auto-archive after</Label>
              <Select
                value={user?.preferences?.autoArchiveDays || 30}
                onChange={e =>
                  handlePreferenceUpdate(
                    'autoArchiveDays',
                    parseInt(e.target.value)
                  )
                }
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="0">Never</option>
              </Select>
            </div>
          </CardContent>
        </PreferencesCard>
      </ProfileContainer>
    </Layout>
  );
};

export default ProfilePage;
