import userEvent from '@testing-library/user-event';
import { auth } from '../../../services/api';
import { render, screen, waitFor } from '../../../tests/setup';
import LoginPage from '../LoginPage';

// Mock the API module
jest.mock('../../../services/api', () => {
  const originalModule = jest.requireActual('../../../services/api');
  return {
    ...originalModule,
    auth: {
      login: jest.fn(),
    },
  };
});

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the useAuth hook
const mockCheckAuth = jest.fn();
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    checkAuth: mockCheckAuth,
    isAuthenticated: false,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth.login as jest.Mock).mockResolvedValue({
      id: 'admin-123',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
    });
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);

    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('disables submit until both fields are filled', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Email'), 'admin@example.com');
    expect(loginButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    expect(loginButton).not.toBeDisabled();
  });

  it('submits login form successfully', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'admin@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'password123',
      });
    });

    expect(mockCheckAuth).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('handles login error correctly', async () => {
    (auth.login as jest.Mock).mockRejectedValue(
      new Error('Invalid credentials')
    );

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'wrong@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('reveals a 2FA code field when the server requires TOTP', async () => {
    (auth.login as jest.Mock).mockRejectedValue(
      new Error('TOTP code required')
    );

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'admin@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Enter your 2FA code')).toBeInTheDocument();
    });

    const totpInput = screen.getByPlaceholderText(
      '6-digit code or backup code'
    );
    expect(totpInput).toBeInTheDocument();

    // The form stays invalid until a code is entered too.
    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
    await user.type(totpInput, '123456');
    expect(screen.getByRole('button', { name: 'Login' })).not.toBeDisabled();

    (auth.login as jest.Mock).mockResolvedValue({
      id: 'admin-123',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
    });
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(auth.login).toHaveBeenLastCalledWith({
        email: 'admin@example.com',
        password: 'password123',
        totpCode: '123456',
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('shows loading state during login', async () => {
    (auth.login as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    await user.type(emailInput, 'admin@example.com');
    await user.type(passwordInput, 'password123');

    const loginButton = screen.getByRole('button', { name: 'Login' });
    await user.click(loginButton);

    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(loginButton).toBeDisabled();
  });
});
