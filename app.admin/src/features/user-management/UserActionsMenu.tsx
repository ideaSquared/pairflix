import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@pairflix/components';
import { AdminUser } from '../../services/api/admin';

interface UserActionsMenuProps {
  user: AdminUser;
  onStatusChange: (
    userId: string,
    newStatus: AdminUser['status'],
    reason?: string
  ) => void;
  onDelete: (userId: string) => void;
  onResetPassword: (userId: string) => void;
}

const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuButton = styled(Button)`
  padding: 6px 12px;
  min-width: auto;
`;

const MenuDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  right: 0;
  z-index: 10;
  min-width: 200px;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`;

const MenuItem = styled.button<{ danger?: boolean }>`
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  color: ${({ danger, theme }) =>
    danger ? theme.colors.text.error : theme.colors.text.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.background.hover};
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 4px 0;
`;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 24px;
  width: 400px;
  max-width: 90%;
`;

const DialogTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
`;

const DialogText = styled.p`
  margin-bottom: 24px;
`;

const DialogInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

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
  const [newStatus, setNewStatus] = useState<AdminUser['status']>('active');

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

  const handleOpenDialog = (
    type: 'delete' | 'status',
    status?: AdminUser['status']
  ) => {
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
      onDelete(user.user_id);
    } else if (dialogType === 'status') {
      onStatusChange(user.user_id, newStatus, statusReason);
    }
    handleCloseDialog();
  };

  return (
    <>
      <MenuContainer onClick={e => e.stopPropagation()}>
        <MenuButton variant="secondary" size="small" onClick={toggleMenu}>
          Actions
        </MenuButton>

        <MenuDropdown isOpen={isOpen}>
          {user.status !== 'active' && (
            <MenuItem onClick={() => handleOpenDialog('status', 'active')}>
              Activate User
            </MenuItem>
          )}

          {user.status !== 'suspended' && (
            <MenuItem onClick={() => handleOpenDialog('status', 'suspended')}>
              Suspend User
            </MenuItem>
          )}

          {user.status !== 'banned' && (
            <MenuItem onClick={() => handleOpenDialog('status', 'banned')}>
              Ban User
            </MenuItem>
          )}

          <MenuDivider />

          <MenuItem onClick={() => onResetPassword(user.user_id)}>
            Reset Password
          </MenuItem>

          <MenuDivider />

          <MenuItem danger onClick={() => handleOpenDialog('delete')}>
            Delete User
          </MenuItem>
        </MenuDropdown>
      </MenuContainer>

      {/* Confirmation Dialog */}
      {dialogOpen && (
        <DialogOverlay>
          <DialogContent>
            {dialogType === 'delete' ? (
              <>
                <DialogTitle>Delete User</DialogTitle>
                <DialogText>
                  Are you sure you want to delete user {user.username}? This
                  action cannot be undone.
                </DialogText>
              </>
            ) : (
              <>
                <DialogTitle>Change User Status</DialogTitle>
                <DialogText>
                  Change status of {user.username} to {newStatus}?
                </DialogText>
                <DialogInput
                  type="text"
                  placeholder="Reason (optional)"
                  value={statusReason}
                  onChange={e => setStatusReason(e.target.value)}
                />
              </>
            )}

            <DialogActions>
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
            </DialogActions>
          </DialogContent>
        </DialogOverlay>
      )}
    </>
  );
};

export default UserActionsMenu;
