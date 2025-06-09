import {
  Badge,
  Button,
  Flex,
  Modal,
  Select,
  Textarea,
  Typography,
} from '@pairflix/components';
import React from 'react';
import { User, UserStatus } from './types';
import { getBadgeVariant } from './utils';
interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  newStatus: UserStatus;
  setNewStatus: React.Dispatch<React.SetStateAction<UserStatus>>;
  statusChangeReason: string;
  setStatusChangeReason: React.Dispatch<React.SetStateAction<string>>;
  onChangeStatus: () => Promise<void>;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  isOpen,
  onClose,
  user,
  newStatus,
  setNewStatus,
  statusChangeReason,
  setStatusChangeReason,
  onChangeStatus,
}) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change User Status">
      <form
        onSubmit={e => {
          e.preventDefault();
          onChangeStatus();
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Typography gutterBottom>
            Current status for <strong>{user.username}</strong>:{' '}
            <Badge variant={getBadgeVariant(user.status)}>{user.status}</Badge>
          </Typography>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="new-status"
            style={{ display: 'block', marginBottom: '8px' }}
          >
            New Status
          </label>
          <Select
            id="new-status"
            value={newStatus}
            onChange={e => setNewStatus(e.target.value as UserStatus)}
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
          <label
            htmlFor="status-reason"
            style={{ display: 'block', marginBottom: '8px' }}
          >
            Reason for Change (optional)
          </label>
          <Textarea
            id="status-reason"
            rows={3}
            value={statusChangeReason}
            onChange={e => setStatusChangeReason(e.target.value)}
            placeholder="Add a note explaining why the status was changed"
            isFullWidth
          />
        </div>

        <Flex justifyContent="end" gap="md" style={{ marginTop: '20px' }}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Change Status
          </Button>
        </Flex>
      </form>
    </Modal>
  );
};

export default ChangeStatusModal;
