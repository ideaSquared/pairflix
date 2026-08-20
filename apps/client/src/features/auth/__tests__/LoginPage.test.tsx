import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { auth } from '../../../services/api';
import { render, screen, waitFor } from '../../../tests/setup';
import LoginPage from '../LoginPage';

// Mock the API module
vi.mock('../../../services/api', async () => {
  const originalModule = await vi.importActual('../../../services/api');
  return {
    ...originalModule,
    auth: {
      login: vi.fn(),
    },
  };
});

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

// Mock the useAuth hook
const mockCheckAuth = vi.fn();
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    checkAuth: mockCheckAuth,
    isAuthenticated: false,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth.login as Mock).mockResolvedValue({
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
    });
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);

    // Verify form elements are rendered
    expect(screen.getByText('Login to PairFlix')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('submits login form successfully', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    // Fill in the form
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Submit the form
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await user.click(loginButton);

    // Verify API call
    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Verify auth was refreshed and navigation occurred
    expect(mockCheckAuth).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/tonight');
  });

  it('handles login error correctly', async () => {
    // Mock failed login
    (auth.login as Mock).mockRejectedValue(new Error('Invalid credentials'));

    const user = userEvent.setup();
    render(<LoginPage />);

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

    // Verify navigation didn't happen
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('requires email and password fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    // Try to submit without filling the form
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await user.click(loginButton);

    // Since the inputs have the required attribute, the form won't submit
    expect(auth.login).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
