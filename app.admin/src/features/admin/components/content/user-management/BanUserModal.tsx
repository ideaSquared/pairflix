import {
	Button,
	Flex,
	Modal,
	Textarea,
	Typography,
} from '@pairflix/components';
import React from 'react';
import { User } from './types';

interface BanUserModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: User | null;
	onBan: () => Promise<void>;
	banReason: string;
	setBanReason: React.Dispatch<React.SetStateAction<string>>;
}

const BanUserModal: React.FC<BanUserModalProps> = ({
	isOpen,
	onClose,
	user,
	onBan,
	banReason,
	setBanReason,
}) => {
	if (!user) return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} title='Ban User'>
			<Typography gutterBottom>
				Are you sure you want to ban <strong>{user.username}</strong>? This will
				prevent the user from logging in and using the platform.
			</Typography>

			<div style={{ marginBottom: '16px', marginTop: '16px' }}>
				<label
					htmlFor='ban-reason'
					style={{ display: 'block', marginBottom: '8px' }}
				>
					Reason for Ban
				</label>
				<Textarea
					id='ban-reason'
					rows={3}
					value={banReason}
					onChange={(e) => setBanReason(e.target.value)}
					placeholder='Explain why this user is being banned'
					fullWidth
				/>
			</div>

			<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
				<Button variant='secondary' onClick={onClose}>
					Cancel
				</Button>
				<Button variant='danger' onClick={onBan}>
					Ban User
				</Button>
			</Flex>
		</Modal>
	);
};

export default BanUserModal;
