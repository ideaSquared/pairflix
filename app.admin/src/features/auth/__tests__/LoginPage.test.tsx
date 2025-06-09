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
      token: 'fake-token',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      },
    });
    localStorageMock.clear();
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);

    // Verify form elements are rendered
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
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

    // Verify token was saved and navigation occurred
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'admin_token',
      'fake-token'
    );
    expect(mockCheckAuth).toHaveBeenCalled();

    // Wait for navigation to happen (due to setTimeout in component)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles login error correctly', async () => {
    // Mock failed login
    (auth.login as jest.Mock).mockRejectedValue(
      new Error('Invalid credentials')
    );

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
