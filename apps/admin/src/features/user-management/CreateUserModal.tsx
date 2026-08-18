import {
  Button,
  ErrorText,
  Input,
  InputGroup,
  Select,
} from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import type { UserRole, UserStatus } from '../../services/api/admin';
import * as styles from './CreateUserModal.css';

interface CreateUserModalProps {
  onClose: () => void;
  onCreate: (data: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
  }) => Promise<void>;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  onClose,
  onCreate,
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [status, setStatus] = useState<UserStatus>('active');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onCreate({ username, email, password, role, status });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.dialogOverlay}>
      <div
        className={styles.dialogContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-title"
      >
        <h3 id="create-user-title" className={styles.dialogTitle}>
          Create User
        </h3>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <ErrorText>{error}</ErrorText>}

          <InputGroup isFullWidth>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              isFullWidth
              disabled={isSubmitting}
            />
          </InputGroup>

          <InputGroup isFullWidth>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              isFullWidth
              disabled={isSubmitting}
            />
          </InputGroup>

          <InputGroup isFullWidth>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              isFullWidth
              disabled={isSubmitting}
            />
          </InputGroup>

          <Select
            value={role}
            onChange={e => setRole(e.target.value as UserRole)}
            disabled={isSubmitting}
            isFullWidth
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Select>

          <Select
            value={status}
            onChange={e => setStatus(e.target.value as UserStatus)}
            disabled={isSubmitting}
            isFullWidth
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </Select>

          <div className={styles.dialogActions}>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="small"
              disabled={isSubmitting || !username || !email || !password}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
