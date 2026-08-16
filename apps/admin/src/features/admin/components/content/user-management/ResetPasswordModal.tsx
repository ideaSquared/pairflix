import { Button, Flex, Modal, Typography } from '@pairflix/components';
import React from 'react';
import * as styles from './ResetPasswordModal.css';
import type { User } from './types';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onReset: () => Promise<void>;
  newPassword: string;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onReset,
  newPassword,
}) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset Password">
      <Typography gutterBottom>
        Are you sure you want to reset the password for{' '}
        <strong>{user.username}</strong>? This will generate a new password for
        the user.
      </Typography>

      {newPassword && (
        <div className={styles.passwordDisplay}>
          New Password: {newPassword}
        </div>
      )}

      <Flex justifyContent="end" gap="md" className={styles.modalFooter}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onReset}>
          Reset Password
        </Button>
      </Flex>
    </Modal>
  );
};

export default ResetPasswordModal;
