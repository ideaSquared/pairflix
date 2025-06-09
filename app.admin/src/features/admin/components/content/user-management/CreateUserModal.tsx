import {
  Button,
  Flex,
  H3,
  Input,
  InputError,
  InputLabel,
  Modal,
} from '@pairflix/components';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { FiUser } from 'react-icons/fi';
import styled from 'styled-components';
import { UserRole, UserStatus } from './types';

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StyledSelect = styled.select`
  background: ${({ theme }) => theme.colors.background.input};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  width: 100%;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}40`};
  }
`;

const ModalContent = styled.div`
  max-width: 500px;
  width: 100%;
`;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
  }) => void;
}

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'admin', label: 'Admin' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
];

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [status, setStatus] = useState<UserStatus>('active');

  // Validation state
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      username?: string;
      email?: string;
      password?: string;
    } = {};

    // Validate username
    if (!username) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
      newErrors.username =
        'Username must be 3-30 characters and contain only letters, numbers, underscore, or hyphen';
    }

    // Validate email
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave({
        username,
        email,
        password,
        role,
        status,
      });

      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('user');
      setStatus('active');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <H3>Create New User</H3>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <InputLabel htmlFor="username">Username</InputLabel>
            <Input
              id="username"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              placeholder="Enter username"
              error={!!errors.username}
              isFullWidth
            />
            {errors.username && <InputError>{errors.username}</InputError>}
          </FormGroup>

          <FormGroup>
            <InputLabel htmlFor="email">Email</InputLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="Enter email"
              error={!!errors.email}
              isFullWidth
            />
            {errors.email && <InputError>{errors.email}</InputError>}
          </FormGroup>

          <FormGroup>
            <InputLabel htmlFor="password">Password</InputLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              error={!!errors.password}
              isFullWidth
            />
            {errors.password && <InputError>{errors.password}</InputError>}
          </FormGroup>

          <FormGroup>
            <InputLabel htmlFor="role">Role</InputLabel>
            <StyledSelect
              id="role"
              value={role}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setRole(e.target.value as UserRole)
              }
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </StyledSelect>
          </FormGroup>

          <FormGroup>
            <InputLabel htmlFor="status">Status</InputLabel>
            <StyledSelect
              id="status"
              value={status}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setStatus(e.target.value as UserStatus)
              }
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </StyledSelect>
          </FormGroup>

          <Flex justifyContent="end" gap="md" style={{ marginTop: '20px' }}>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <FiUser style={{ marginRight: '8px' }} /> Create User
            </Button>
          </Flex>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateUserModal;
