import userEvent from '@testing-library/user-event';
import { user as userApi } from '../../../services/api';
import { render, screen, waitFor, within } from '../../../tests/setup';
import ProfilePage from '../ProfilePage';

// Mock the API module
jest.mock('../../../services/api', () => {
	const originalModule = jest.requireActual('../../../services/api');
	return {
		...originalModule,
		user: {
			...originalModule.user,
			updatePassword: jest.fn(),
			updateEmail: jest.fn(),
			updateUsername: jest.fn(),
			updatePreferences: jest.fn(),
		},
	};
});

// Create mock objects
const mockLogout = jest.fn();
const mockCheckAuth = jest.fn();

// Mock the useAuth hook using a factory function
jest.mock('../../../hooks/useAuth', () => {
	return {
		useAuth: () => ({
			user: {
				user_id: 'user-1',
				username: 'testuser',
				email: 'test@example.com',
				preferences: {
					theme: 'dark',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: ['action', 'comedy'],
				},
			},
			isAuthenticated: true,
			logout: mockLogout,
			checkAuth: mockCheckAuth,
		}),
	};
});

describe('ProfilePage', () => {
	beforeEach(() => {
		jest.clearAllMocks();

		// Mock successful API responses
		(userApi.updatePassword as jest.Mock).mockResolvedValue({
			message: 'Password updated successfully',
			token: 'new-token',
		});

		(userApi.updateEmail as jest.Mock).mockResolvedValue({
			message: 'Email updated successfully',
			token: 'new-token',
		});

		(userApi.updateUsername as jest.Mock).mockResolvedValue({
			message: 'Username updated successfully',
			token: 'new-token',
		});

		(userApi.updatePreferences as jest.Mock).mockResolvedValue({
			message: 'Preferences updated successfully',
			token: 'new-token',
		});

		// Mock localStorage
		Object.defineProperty(window, 'localStorage', {
			value: {
				getItem: jest.fn(),
				setItem: jest.fn(),
				removeItem: jest.fn(),
			},
			writable: true,
		});
	});

	it('renders user profile information', () => {
		render(<ProfilePage />);

		// Check if user information is displayed
		expect(screen.getByText('Current Profile')).toBeInTheDocument();
		expect(screen.getByText('Username:')).toBeInTheDocument();
		expect(screen.getByText('testuser')).toBeInTheDocument();
		expect(screen.getByText('Email:')).toBeInTheDocument();
		expect(screen.getByText('test@example.com')).toBeInTheDocument();
	});

	it('allows updating username', async () => {
		const user = userEvent.setup();
		render(<ProfilePage />);

		// Fill in the new username
		const usernameInput = screen.getByPlaceholderText('New Username');
		await user.type(usernameInput, 'newusername');

		// Submit the form
		const updateButton = screen.getByText('Update Username');
		await user.click(updateButton);

		// Verify API was called with correct data
		expect(userApi.updateUsername).toHaveBeenCalledWith({
			username: 'newusername',
		});

		// Check for success message
		await waitFor(() => {
			expect(
				screen.getByText('Username updated successfully')
			).toBeInTheDocument();
		});

		// Verify the localStorage was updated with the new token
		expect(window.localStorage.setItem).toHaveBeenCalledWith(
			'token',
			'new-token'
		);

		// Verify the auth check was triggered
		expect(mockCheckAuth).toHaveBeenCalled();
	});

	it('validates username format', async () => {
		const user = userEvent.setup();
		render(<ProfilePage />);

		// Fill in an invalid username (too short)
		const usernameInput = screen.getByPlaceholderText('New Username');
		await user.type(usernameInput, 'ab');

		// Submit the form
		const updateButton = screen.getByText('Update Username');
		await user.click(updateButton);

		// Verify API was NOT called
		expect(userApi.updateUsername).not.toHaveBeenCalled();

		// Check for error message
		expect(
			screen.getByText(/Username must be 3-30 characters/)
		).toBeInTheDocument();
	});

	it('validates email format', async () => {
		const user = userEvent.setup();
		render(<ProfilePage />);

		// Fill in an invalid email
		const emailInput = screen.getByPlaceholderText('New Email');
		const passwordInput = screen.getAllByPlaceholderText('Current Password')[0];

		await user.type(emailInput, 'invalid-email');
		await user.type(passwordInput, 'password123');

		// Submit the form
		const updateButton = screen.getByText('Update Email');
		await user.click(updateButton);

		// Verify the API was NOT called - this is how we know validation prevented submission
		expect(userApi.updateEmail).not.toHaveBeenCalled();

		// Now try with a valid email
		await user.clear(emailInput);
		await user.type(emailInput, 'valid@example.com');

		// Submit the form again
		await user.click(updateButton);

		// The API should now be called with the valid email
		expect(userApi.updateEmail).toHaveBeenCalledWith({
			email: 'valid@example.com',
			password: 'password123',
		});
	});

	it('allows updating password', async () => {
		const user = userEvent.setup();
		render(<ProfilePage />);

		// Get password fields
		const currentPasswordInput =
			screen.getAllByPlaceholderText('Current Password')[1]; // Second one is for password update
		const newPasswordInput = screen.getByPlaceholderText('New Password');
		const confirmPasswordInput = screen.getByPlaceholderText(
			'Confirm New Password'
		);

		// Fill in passwords
		await user.type(currentPasswordInput, 'oldpassword');
		await user.type(newPasswordInput, 'newpassword123');
		await user.type(confirmPasswordInput, 'newpassword123');

		// Submit the form
		const updateButton = screen.getByText('Update Password');
		await user.click(updateButton);

		// Verify API was called with correct data
		expect(userApi.updatePassword).toHaveBeenCalledWith({
			currentPassword: 'oldpassword',
			newPassword: 'newpassword123',
		});

		// Check for success message
		await waitFor(() => {
			expect(
				screen.getByText('Password updated successfully')
			).toBeInTheDocument();
		});
	});

	it('validates password confirmation', async () => {
		const user = userEvent.setup();
		render(<ProfilePage />);

		// Get password fields
		const currentPasswordInput =
			screen.getAllByPlaceholderText('Current Password')[1];
		const newPasswordInput = screen.getByPlaceholderText('New Password');
		const confirmPasswordInput = screen.getByPlaceholderText(
			'Confirm New Password'
		);

		// Fill in passwords with non-matching confirmation
		await user.type(currentPasswordInput, 'oldpassword');
		await user.type(newPasswordInput, 'newpassword123');
		await user.type(confirmPasswordInput, 'different123');

		// Submit the form
		const updateButton = screen.getByText('Update Password');
		await user.click(updateButton);

		// Verify API was NOT called
		expect(userApi.updatePassword).not.toHaveBeenCalled();

		// Check for error message
		expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
	});

	it('validates password length', async () => {
		const user = userEvent.setup();
		render(<ProfilePage />);

		// Get password fields
		const currentPasswordInput =
			screen.getAllByPlaceholderText('Current Password')[1];
		const newPasswordInput = screen.getByPlaceholderText('New Password');
		const confirmPasswordInput = screen.getByPlaceholderText(
			'Confirm New Password'
		);

		// Fill in passwords with short password
		await user.type(currentPasswordInput, 'oldpassword');
		await user.type(newPasswordInput, 'short');
		await user.type(confirmPasswordInput, 'short');

		// Submit the form
		const updateButton = screen.getByText('Update Password');
		await user.click(updateButton);

		// Verify API was NOT called
		expect(userApi.updatePassword).not.toHaveBeenCalled();

		// Check for error message
		expect(
			screen.getByText('Password must be at least 8 characters long')
		).toBeInTheDocument();
	});

	it('allows updating theme preference', async () => {
		const user = userEvent.setup();
		render(<ProfilePage />);

		// Find the theme dropdown by looking for its neighbor label text
		const themeText = screen.getByText('Theme');
		const themeRow = themeText.closest('.preference-row');

		// Now find the select element within this row
		const themeDropdown = within(themeRow as HTMLElement).getByRole('combobox');

		// Change theme to light
		await user.selectOptions(themeDropdown, 'light');

		// Verify API was called with correct data
		expect(userApi.updatePreferences).toHaveBeenCalledWith({
			theme: 'light',
		});

		// Check for success message
		await waitFor(() => {
			expect(
				screen.getByText('Preferences updated successfully')
			).toBeInTheDocument();
		});
	});

	it('handles API errors gracefully', async () => {
		// Mock API error
		(userApi.updateUsername as jest.Mock).mockRejectedValueOnce(
			new Error('Username already taken')
		);

		const user = userEvent.setup();
		render(<ProfilePage />);

		// Fill in the new username
		const usernameInput = screen.getByPlaceholderText('New Username');
		await user.type(usernameInput, 'existinguser');

		// Submit the form
		const updateButton = screen.getByText('Update Username');
		await user.click(updateButton);

		// Check for error message
		await waitFor(() => {
			expect(screen.getByText('Username already taken')).toBeInTheDocument();
		});
	});

	it('logs out user on authentication error', async () => {
		// Mock auth error
		(userApi.updateEmail as jest.Mock).mockRejectedValueOnce(
			new Error('Authentication required')
		);

		const user = userEvent.setup();
		render(<ProfilePage />);

		// Fill in the new email and password
		const emailInput = screen.getByPlaceholderText('New Email');
		const passwordInput = screen.getAllByPlaceholderText('Current Password')[0];

		await user.type(emailInput, 'new@example.com');
		await user.type(passwordInput, 'password');

		// Submit the form
		const updateButton = screen.getByText('Update Email');
		await user.click(updateButton);

		// Verify logout was called
		await waitFor(() => {
			expect(mockLogout).toHaveBeenCalled();
		});
	});
});
