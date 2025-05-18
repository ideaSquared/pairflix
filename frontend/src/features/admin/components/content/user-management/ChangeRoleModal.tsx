import React from 'react';
import { Badge } from '../../../../../components/common/Badge';
import { Button } from '../../../../../components/common/Button';
import { Input } from '../../../../../components/common/Input';
import { Flex } from '../../../../../components/common/Layout';
import { Modal } from '../../../../../components/common/Modal';
import { Select } from '../../../../../components/common/Select';
import { Typography } from '../../../../../components/common/Typography';
import { User, UserRole } from './types';
import { getRoleBadgeVariant } from './utils';

interface ChangeRoleModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: User | null;
	newRole: UserRole;
	setNewRole: React.Dispatch<React.SetStateAction<UserRole>>;
	roleChangeReason: string;
	setRoleChangeReason: React.Dispatch<React.SetStateAction<string>>;
	onChangeRole: () => Promise<void>;
}

const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
	isOpen,
	onClose,
	user,
	newRole,
	setNewRole,
	roleChangeReason,
	setRoleChangeReason,
	onChangeRole,
}) => {
	if (!user) return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} title='Change User Role'>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onChangeRole();
				}}
			>
				<div style={{ marginBottom: '16px' }}>
					<Typography gutterBottom>
						Current role for <strong>{user.username}</strong>:{' '}
						<Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
					</Typography>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<label
						htmlFor='new-role'
						style={{ display: 'block', marginBottom: '8px' }}
					>
						New Role
					</label>
					<Select
						id='new-role'
						value={newRole}
						onChange={(e) => setNewRole(e.target.value as UserRole)}
						fullWidth
					>
						<option value='user'>User</option>
						<option value='moderator'>Moderator</option>
						<option value='admin'>Admin</option>
					</Select>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<label
						htmlFor='role-reason'
						style={{ display: 'block', marginBottom: '8px' }}
					>
						Reason for Change (optional)
					</label>
					<Input
						id='role-reason'
						as='textarea'
						rows={3}
						value={roleChangeReason}
						onChange={(e) => setRoleChangeReason(e.target.value)}
						placeholder='Add a note explaining why the role was changed'
						fullWidth
					/>
				</div>

				<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
					<Button variant='secondary' onClick={onClose}>
						Cancel
					</Button>
					<Button variant='primary' type='submit'>
						Change Role
					</Button>
				</Flex>
			</form>
		</Modal>
	);
};

export default ChangeRoleModal;
