import { Button } from '@pairflix/components';
import React, { useState } from 'react';
import type { AdminUserSummary } from '../../services/api/admin';
import * as styles from './UserActionsMenu.css';

type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'banned';

interface UserActionsMenuProps {
  user: AdminUserSummary;
  onStatusChange: (
    userId: string,
    newStatus: UserStatus,
    reason?: string
  ) => void;
  onDelete: (userId: string) => void;
  onResetPassword: (userId: string) => void;
}

const UserActionsMenu: React.FC<UserActionsMenuProps> = ({
  user,
  onStatusChange,
  onDelete,
  onResetPassword,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'delete' | 'status' | null>(
    null
  );
  const [statusReason, setStatusReason] = useState('');
  const [newStatus, setNewStatus] = useState<UserStatus>('active');

  // Close the menu if clicked outside
  React.useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleOpenDialog = (type: 'delete' | 'status', status?: UserStatus) => {
    setDialogType(type);
    if (status) setNewStatus(status);
    setDialogOpen(true);
    setIsOpen(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
    setStatusReason('');
  };

  const handleConfirm = () => {
    if (dialogType === 'delete') {
      onDelete(user.id);
    } else if (dialogType === 'status') {
      onStatusChange(user.id, newStatus, statusReason);
    }
    handleCloseDialog();
  };

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation guard only, not itself an interactive control (the real controls -- Button, menu items -- are its children); carried over unchanged from the prior CSS-in-JS version, which this lint rule never saw due to its capitalized wrapper tag name */}
      <div className={styles.menuContainer} onClick={e => e.stopPropagation()}>
        <Button
          className={styles.menuButton}
          variant="secondary"
          size="small"
          onClick={toggleMenu}
        >
          Actions
        </Button>

        <div className={styles.menuDropdown({ isOpen })}>
          {user.status !== 'active' && (
            <button
              className={styles.menuItem({ danger: false })}
              onClick={() => handleOpenDialog('status', 'active')}
            >
              Activate User
            </button>
          )}

          {user.status !== 'suspended' && (
            <button
              className={styles.menuItem({ danger: false })}
              onClick={() => handleOpenDialog('status', 'suspended')}
            >
              Suspend User
            </button>
          )}

          {user.status !== 'banned' && (
            <button
              className={styles.menuItem({ danger: false })}
              onClick={() => handleOpenDialog('status', 'banned')}
            >
              Ban User
            </button>
          )}

          <div className={styles.menuDivider} />

          <button
            className={styles.menuItem({ danger: false })}
            onClick={() => onResetPassword(user.id)}
          >
            Reset Password
          </button>

          <div className={styles.menuDivider} />

          <button
            className={styles.menuItem({ danger: true })}
            onClick={() => handleOpenDialog('delete')}
          >
            Delete User
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {dialogOpen && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialogContent}>
            {dialogType === 'delete' ? (
              <>
                <h3 className={styles.dialogTitle}>Delete User</h3>
                <p className={styles.dialogText}>
                  Are you sure you want to delete user {user.username}? This
                  action cannot be undone.
                </p>
              </>
            ) : (
              <>
                <h3 className={styles.dialogTitle}>Change User Status</h3>
                <p className={styles.dialogText}>
                  Change status of {user.username} to {newStatus}?
                </p>
                <input
                  className={styles.dialogInput}
                  type="text"
                  placeholder="Reason (optional)"
                  value={statusReason}
                  onChange={e => setStatusReason(e.target.value)}
                />
              </>
            )}

            <div className={styles.dialogActions}>
              <Button
                variant="secondary"
                size="small"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                variant={dialogType === 'delete' ? 'danger' : 'primary'}
                size="small"
                onClick={handleConfirm}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserActionsMenu;
