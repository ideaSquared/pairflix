import { Button, Flex, Modal, Select, Typography } from '@pairflix/components';
import React from 'react';
import { User, UserRole, UserStatus } from './types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (user: User) => Promise<void>;
  setUserToEdit: React.Dispatch<React.SetStateAction<User | null>>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  setUserToEdit,
}) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User">
      <form
        onSubmit={e => {
          e.preventDefault();
          if (user) onSave(user);
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="user-role"
            style={{ display: 'block', marginBottom: '8px' }}
          >
            Role
          </label>
          <Select
            id="user-role"
            value={user.role}
            onChange={e =>
              setUserToEdit({
                ...user,
                role: e.target.value as UserRole,
              })
            }
            isFullWidth
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </Select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="user-status"
            style={{ display: 'block', marginBottom: '8px' }}
          >
            Status
          </label>
          <Select
            id="user-status"
            value={user.status}
            onChange={e =>
              setUserToEdit({
                ...user,
                status: e.target.value as UserStatus,
              })
            }
            isFullWidth
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </Select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Typography style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            User Information (Read-only)
          </Typography>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>Username:</span>{' '}
            {user.username}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>Name:</span> {user.name}
          </div>
          <div>
            <span style={{ fontWeight: 'bold' }}>Email:</span> {user.email}
          </div>
        </div>

        <Flex justifyContent="end" gap="md" style={{ marginTop: '20px' }}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Flex>
      </form>
    </Modal>
  );
};

export default EditUserModal;
