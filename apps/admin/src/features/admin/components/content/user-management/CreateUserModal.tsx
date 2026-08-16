import {
  Button,
  Flex,
  H3,
  Input,
  InputError,
  InputLabel,
  Modal,
} from '@pairflix/components';
import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { FiUser } from 'react-icons/fi';
import * as styles from './CreateUserModal.css';
import type { UserRole, UserStatus } from './types';

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
      <div className={styles.modalContent}>
        <H3>Create New User</H3>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
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
          </div>

          <div className={styles.formGroup}>
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
          </div>

          <div className={styles.formGroup}>
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
          </div>

          <div className={styles.formGroup}>
            <InputLabel htmlFor="role">Role</InputLabel>
            <select
              className={styles.styledSelect}
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
            </select>
          </div>

          <div className={styles.formGroup}>
            <InputLabel htmlFor="status">Status</InputLabel>
            <select
              className={styles.styledSelect}
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
            </select>
          </div>

          <Flex justifyContent="end" gap="md" style={{ marginTop: '20px' }}>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <FiUser style={{ marginRight: '8px' }} /> Create User
            </Button>
          </Flex>
        </form>
      </div>
    </Modal>
  );
};

export default CreateUserModal;
