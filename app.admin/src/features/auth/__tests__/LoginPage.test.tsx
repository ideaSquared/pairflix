import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { auth } from '../../../services/api';
import { darkTheme } from '../../../styles/theme';
import LoginPage from '../LoginPage';

// Mock modules
jest.mock('../../../services/api', () => ({
  auth: {
    login: jest.fn(),
  },
}));

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    checkAuth: jest.fn(),
  }),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Helper component to wrap the LoginPage with required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={darkTheme}>{children}</ThemeProvider>
  </BrowserRouter>
);

describe('LoginPage', () => {
  // Setup localStorage mock
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  // Replace the global localStorage with our mock before each test
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (auth.login as jest.Mock).mockResolvedValue({
      token: 'fake-admin-token',
      user: {
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      },
    });
    localStorageMock.clear();
  });

  it('renders login form correctly', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Verify form elements are rendered
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows validation error for empty fields', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Try to submit without filling fields
    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton).toBeDisabled(); // Button should be disabled when form is invalid

    // Fill only email
    const emailInput = screen.getByPlaceholderText('Email');
    await user.type(emailInput, 'admin@example.com');
    expect(loginButton).toBeDisabled(); // Still disabled without password

    // Fill only password (clear email first)
    await user.clear(emailInput);
    const passwordInput = screen.getByPlaceholderText('Password');
    await user.type(passwordInput, 'password123');
    expect(loginButton).toBeDisabled(); // Still disabled without email
  });

  it('enables submit button when form is valid', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    // Fill in both fields
    await user.type(emailInput, 'admin@example.com');
    await user.type(passwordInput, 'password123');

    // Button should now be enabled
    expect(loginButton).not.toBeDisabled();
  });

  it('submits login form successfully', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Fill in the form
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    await user.type(emailInput, 'admin@example.com');
    await user.type(passwordInput, 'password123');

    // Submit the form
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await user.click(loginButton);

    // Verify API call
    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'password123',
      });
    });

    // Verify token was saved with correct key
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'admin_token',
      'fake-admin-token'
    );

    // Verify user data was saved
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify({
        user_id: 'admin-123',
        email: 'admin@example.com',
        username: 'admin',
        role: 'admin',
      })
    );

    // Wait for navigation to happen
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('handles login error correctly', async () => {
    // Mock failed login
    (auth.login as jest.Mock).mockRejectedValue(
      new Error('Invalid credentials')
    );

    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Fill in the form
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');

    // Submit the form
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await user.click(loginButton);

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    // Verify auth data was cleared
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('admin_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');

    // Verify navigation didn't happen
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows loading state during login', async () => {
    // Mock delayed login response
    (auth.login as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Fill in the form
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    await user.type(emailInput, 'admin@example.com');
    await user.type(passwordInput, 'password123');

    // Submit the form
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await user.click(loginButton);

    // Verify loading state
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(loginButton).toBeDisabled();
  });

  it('handles login response without token', async () => {
    // Mock response without token
    (auth.login as jest.Mock).mockResolvedValue({
      user: {
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      },
      // Missing token
    });

    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Fill in and submit form
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    await user.type(emailInput, 'admin@example.com');
    await user.type(passwordInput, 'password123');

    const loginButton = screen.getByRole('button', { name: 'Login' });
    await user.click(loginButton);

    // Verify error message appears
    await waitFor(() => {
      expect(
        screen.getByText('No authentication token received')
      ).toBeInTheDocument();
    });

    // Verify no navigation
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
