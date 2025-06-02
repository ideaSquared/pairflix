import React from 'react';
import { FiEdit, FiKey } from 'react-icons/fi';
import {
	RiExchangeLine,
	RiHistoryLine,
	RiUserFollowLine,
	RiUserForbidLine,
	RiUserSettingsLine,
	RiUserUnfollowLine,
} from 'react-icons/ri';
import { User, UserRole, UserStatus } from './types';
import { getBadgeVariant, getRoleBadgeVariant, IconStyle } from './utils';

import {
	Badge,
	Card,
	DataTable,
	Flex,
	TableActionButton,
	TableColumn,
} from '@pairflix/components';

// Create a type that extends User to satisfy the Record<string, unknown> constraint
type UserRecord = User & Record<string, unknown>;

interface UserTableProps {
	users: UserRecord[];
	onEditUser: (user: UserRecord) => void;
	onViewActivity: (user: UserRecord) => void;
	onResetPassword: (user: UserRecord) => void;
	onChangeRole: (user: UserRecord) => void;
	onChangeStatus: (user: UserRecord) => void;
	onActivateUser: (user: UserRecord) => Promise<void>;
	onSuspendUser: (user: UserRecord) => Promise<void>;
	onBanUser: (user: UserRecord) => void;
}

const UserTable: React.FC<UserTableProps> = (props: UserTableProps) => {
	const {
		users,
		onEditUser,
		onViewActivity,
		onResetPassword,
		onChangeRole,
		onChangeStatus,
		onActivateUser,
		onSuspendUser,
		onBanUser,
	} = props;

	// Define columns with type safety
	const columns: TableColumn<UserRecord>[] = [
		{
			key: 'username',
			header: 'Username',
		},
		{
			key: 'name',
			header: 'Name',
		},
		{
			key: 'email',
			header: 'Email',
		},
		{
			key: 'role',
			header: 'Role',
			render: (value, user) => (
				<Badge variant={getRoleBadgeVariant(user.role as UserRole)}>
					{value as UserRole}
				</Badge>
			),
		},
		{
			key: 'status',
			header: 'Status',
			render: (value, user) => (
				<Badge variant={getBadgeVariant(user.status as UserStatus)}>
					{value as UserStatus}
				</Badge>
			),
		},
		{
			key: 'created_at',
			header: 'Joined',
			render: (value) =>
				value ? new Date(value as string).toLocaleDateString() : '',
		},
		{
			key: 'last_login',
			header: 'Last Login',
			render: (value) =>
				value ? new Date(value as string).toLocaleDateString() : 'Never',
		},
	];

	// Define row actions
	const renderActions = (user: UserRecord) => (
		<Flex gap='xs'>
			<TableActionButton onClick={() => onEditUser(user)} title='Edit user'>
				<FiEdit style={IconStyle} />
			</TableActionButton>

			<TableActionButton
				onClick={() => onViewActivity(user)}
				title='View activity'
				variant='secondary'
			>
				<RiHistoryLine style={IconStyle} />
			</TableActionButton>

			<TableActionButton
				onClick={() => onResetPassword(user)}
				title='Reset password'
				variant='secondary'
			>
				<FiKey style={IconStyle} />
			</TableActionButton>

			<TableActionButton
				onClick={() => onChangeRole(user)}
				title='Change role'
				variant='primary'
			>
				<RiUserSettingsLine style={IconStyle} />
			</TableActionButton>

			<TableActionButton
				onClick={() => onChangeStatus(user)}
				title='Change status'
				variant='warning'
			>
				<RiExchangeLine style={IconStyle} />
			</TableActionButton>

			{(user.status as UserStatus) === 'suspended' ||
			(user.status as UserStatus) === 'banned' ? (
				<TableActionButton
					onClick={() => onActivateUser(user)}
					title='Activate user'
					variant='primary'
				>
					<RiUserFollowLine style={IconStyle} />
				</TableActionButton>
			) : (
				<>
					{(user.status as UserStatus) === 'active' ? (
						<TableActionButton
							onClick={() => onSuspendUser(user)}
							title='Suspend user'
							variant='warning'
						>
							<RiUserForbidLine style={IconStyle} />
						</TableActionButton>
					) : (user.status as UserStatus) === 'pending' ||
					  (user.status as UserStatus) === 'inactive' ? (
						<TableActionButton
							onClick={() => onActivateUser(user)}
							title='Activate user'
							variant='primary'
						>
							<RiUserFollowLine style={IconStyle} />
						</TableActionButton>
					) : null}

					<TableActionButton
						variant='danger'
						onClick={() => onBanUser(user)}
						title='Ban user'
					>
						<RiUserUnfollowLine style={IconStyle} />
					</TableActionButton>
				</>
			)}
		</Flex>
	);

	return (
		<Card>
			<DataTable<UserRecord>
				columns={columns}
				data={users}
				emptyMessage='No users found'
				getRowId={(row: UserRecord) => row.id}
				rowActions={renderActions}
				minWidth='1200px'
				aria-label='Users table'
				stickyHeader
			/>
		</Card>
	);
};

export default UserTable;
