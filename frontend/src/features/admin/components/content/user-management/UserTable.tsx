import React from 'react';
import { Badge } from '../../../../../components/common/Badge';
import { Card } from '../../../../../components/common/Card';
import { Flex } from '../../../../../components/common/Layout';
import {
  Table,
  TableActionButton,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../../../../../components/common/Table';
import { User } from './types';
import { getBadgeVariant, getRoleBadgeVariant, IconStyle } from './utils';
import {
  FiEdit,
  FiKey,
} from 'react-icons/fi';
import {
  RiExchangeLine,
  RiHistoryLine,
  RiUserFollowLine,
  RiUserForbidLine,
  RiUserSettingsLine,
  RiUserUnfollowLine,
} from 'react-icons/ri';

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onViewActivity: (user: User) => void;
  onResetPassword: (user: User) => void;
  onChangeRole: (user: User) => void;
  onChangeStatus: (user: User) => void;
  onActivateUser: (user: User) => Promise<void>;
  onSuspendUser: (user: User) => Promise<void>;
  onBanUser: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  onViewActivity,
  onResetPassword,
  onChangeRole,
  onChangeStatus,
  onActivateUser,
  onSuspendUser,
  onBanUser
}) => {
  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Username</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Joined</TableHeaderCell>
              <TableHeaderCell>Last Login</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} style={{ textAlign: 'center' }}>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Flex gap="xs">
                      <TableActionButton
                        onClick={() => onEditUser(user)}
                        title="Edit user"
                      >
                        <FiEdit style={IconStyle} />
                      </TableActionButton>

                      <TableActionButton
                        onClick={() => onViewActivity(user)}
                        title="View activity"
                        variant="secondary"
                      >
                        <RiHistoryLine style={IconStyle} />
                      </TableActionButton>

                      <TableActionButton
                        onClick={() => onResetPassword(user)}
                        title="Reset password"
                        variant="secondary"
                      >
                        <FiKey style={IconStyle} />
                      </TableActionButton>

                      <TableActionButton
                        onClick={() => onChangeRole(user)}
                        title="Change role"
                        variant="primary"
                      >
                        <RiUserSettingsLine style={IconStyle} />
                      </TableActionButton>

                      <TableActionButton
                        onClick={() => onChangeStatus(user)}
                        title="Change status"
                        variant="warning"
                      >
                        <RiExchangeLine style={IconStyle} />
                      </TableActionButton>

                      {user.status === 'suspended' ||
                      user.status === 'banned' ? (
                        <TableActionButton
                          onClick={() => onActivateUser(user)}
                          title="Activate user"
                          variant="primary"
                        >
                          <RiUserFollowLine style={IconStyle} />
                        </TableActionButton>
                      ) : (
                        <>
                          {user.status === 'active' ? (
                            <TableActionButton
                              onClick={() => onSuspendUser(user)}
                              title="Suspend user"
                              variant="warning"
                            >
                              <RiUserForbidLine style={IconStyle} />
                            </TableActionButton>
                          ) : user.status === 'pending' ||
                            user.status === 'inactive' ? (
                            <TableActionButton
                              onClick={() => onActivateUser(user)}
                              title="Activate user"
                              variant="primary"
                            >
                              <RiUserFollowLine style={IconStyle} />
                            </TableActionButton>
                          ) : null}

                          <TableActionButton
                            variant="danger"
                            onClick={() => onBanUser(user)}
                            title="Ban user"
                          >
                            <RiUserUnfollowLine style={IconStyle} />
                          </TableActionButton>
                        </>
                      )}
                    </Flex>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default UserTable;