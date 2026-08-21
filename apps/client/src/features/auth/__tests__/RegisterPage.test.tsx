import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { auth } from '../../../services/api';
import { fireEvent, render, screen, waitFor } from '../../../tests/setup';
import RegisterPage from '../RegisterPage';

// Mock the API module
vi.mock('../../../services/api', async () => {
  const originalModule = await vi.importActual('../../../services/api');
  return {
    ...originalModule,
    auth: {
      register: vi.fn(),
    },
  };
});

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

type FormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  values: FormValues
): Promise<void> => {
  await user.type(screen.getByPlaceholderText('Username'), values.username);
  await user.type(screen.getByPlaceholderText('Email'), values.email);
  await user.type(screen.getByPlaceholderText('Password'), values.password);
  await user.type(
    screen.getByPlaceholderText('Confirm Password'),
    values.confirmPassword
  );
};

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth.register as Mock).mockResolvedValue({
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
    });
  });

  it('renders the registration form', () => {
    render(<RegisterPage />);

    expect(
      screen.getByRole('heading', { name: 'Create Account' })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create Account' })
    ).toBeInTheDocument();
  });

  it('shows "All fields are required" when submitting with a blank field', () => {
    render(<RegisterPage />);

    // The submit button is disabled while any field is blank, so a real click
    // cannot reach validateForm -- submit the form directly to exercise it.
    expect(
      screen.getByRole('button', { name: 'Create Account' })
    ).toBeDisabled();

    const form = document.querySelector('form');
    if (!form) {
      throw new Error('Could not find registration form');
    }
    fireEvent.submit(form);

    expect(screen.getByText('All fields are required')).toBeInTheDocument();
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('rejects an invalid email address', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    // "user@domain" passes the browser's native type="email" check (so the form
    // submits) but fails the component's stricter validator (no dot in domain).
    await fillForm(user, {
      username: 'validuser',
      email: 'user@domain',
      password: 'password123',
      confirmPassword: 'password123',
    });
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(
      screen.getByText('Please provide a valid email address')
    ).toBeInTheDocument();
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('rejects a username that is too short', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await fillForm(user, {
      username: 'ab',
      email: 'valid@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(
      screen.getByText(/Username must be 3-30 characters/)
    ).toBeInTheDocument();
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('rejects a password shorter than the minimum length', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await fillForm(user, {
      username: 'validuser',
      email: 'valid@example.com',
      password: 'short',
      confirmPassword: 'short',
    });
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(
      screen.getByText('Password must be at least 8 characters long')
    ).toBeInTheDocument();
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('rejects mismatched password and confirmation', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await fillForm(user, {
      username: 'validuser',
      email: 'valid@example.com',
      password: 'password123',
      confirmPassword: 'different123',
    });
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('registers successfully and shows the check-your-email view', async () => {
    (auth.register as Mock).mockResolvedValue({
      id: 'user-1',
      username: 'validuser',
      email: 'validuser@example.com',
    });

    const user = userEvent.setup();
    render(<RegisterPage />);

    await fillForm(user, {
      username: 'validuser',
      email: 'validuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(auth.register).toHaveBeenCalledWith({
        email: 'validuser@example.com',
        password: 'password123',
        username: 'validuser',
      });
    });

    expect(screen.getByText('Check Your Email!')).toBeInTheDocument();
    expect(screen.getByText('validuser@example.com')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to Login' })
    ).toBeInTheDocument();
  });

  it('shows the error message when registration is rejected', async () => {
    (auth.register as Mock).mockRejectedValue(
      new Error('Email already in use')
    );

    const user = userEvent.setup();
    render(<RegisterPage />);

    await fillForm(user, {
      username: 'validuser',
      email: 'valid@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
    expect(screen.queryByText('Check Your Email!')).not.toBeInTheDocument();
  });
});
