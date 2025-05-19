import React from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { Button } from '../../../../../components/common/Button';
import {
	FilterGroup,
	FilterItem,
} from '../../../../../components/common/FilterGroup';
import { Input } from '../../../../../components/common/Input';
import { Flex } from '../../../../../components/common/Layout';
import { Select } from '../../../../../components/common/Select';
import { UserManagementFilters } from './types';
import { IconStyle } from './utils';

interface UserFilterProps {
	search: string;
	onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	filters: UserManagementFilters;
	onFilterChange: (name: keyof UserManagementFilters, value: string) => void;
	onApplyFilters: () => void;
	onClearFilters: () => void;
	onCreateUser: () => void;
}

const UserFilter: React.FC<UserFilterProps> = ({
	search,
	onSearchChange,
	filters,
	onFilterChange,
	onApplyFilters,
	onClearFilters,
	onCreateUser,
}) => {
	return (
		<>
			<Flex
				justifyContent='space-between'
				alignItems='center'
				style={{ marginBottom: '20px' }}
			>
				<div style={{ flex: 1 }}>
					<Input
						placeholder='Search users by name, username, or email...'
						value={search}
						onChange={onSearchChange}
						type='search'
						fullWidth
					/>
				</div>
				<Button
					variant='primary'
					style={{ marginLeft: '20px' }}
					onClick={onCreateUser}
				>
					<FiUserPlus style={IconStyle} /> Create User
				</Button>
			</Flex>

			<FilterGroup
				title='Filter Users'
				onApply={onApplyFilters}
				onClear={onClearFilters}
			>
				<FilterItem label='Role'>
					<Select
						value={filters.roleFilter}
						onChange={(e) => onFilterChange('roleFilter', e.target.value)}
						fullWidth
					>
						<option value=''>All Roles</option>
						<option value='admin'>Admin</option>
						<option value='moderator'>Moderator</option>
						<option value='user'>User</option>
					</Select>
				</FilterItem>

				<FilterItem label='Status'>
					<Select
						value={filters.statusFilter}
						onChange={(e) => onFilterChange('statusFilter', e.target.value)}
						fullWidth
					>
						<option value=''>All Statuses</option>
						<option value='active'>Active</option>
						<option value='suspended'>Suspended</option>
						<option value='pending'>Pending</option>
						<option value='inactive'>Inactive</option>
					</Select>
				</FilterItem>

				<FilterItem label='Sort By'>
					<Select
						value={filters.sortBy}
						onChange={(e) => onFilterChange('sortBy', e.target.value)}
						fullWidth
					>
						<option value='username'>Username</option>
						<option value='name'>Name</option>
						<option value='created_at'>Join Date</option>
						<option value='last_login'>Last Login</option>
					</Select>
				</FilterItem>

				<FilterItem label='Sort Order'>
					<Select
						value={filters.sortOrder}
						onChange={(e) =>
							onFilterChange('sortOrder', e.target.value as 'asc' | 'desc')
						}
						fullWidth
					>
						<option value='asc'>Ascending</option>
						<option value='desc'>Descending</option>
					</Select>
				</FilterItem>
			</FilterGroup>
		</>
	);
};

export default UserFilter;
