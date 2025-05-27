import React from 'react';
import styled from 'styled-components';
import { Button } from '../../../../../components/common/Button';
import { Flex } from '../../../../../components/common/Layout';
import { Modal } from '../../../../../components/common/Modal';
import { Typography } from '../../../../../components/common/Typography';
import { User } from './types';

// Styled component for password display
const PasswordDisplay = styled.div`
	margin: 20px 0;
	padding: 15px;
	background-color: #f8f9fa;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	text-align: center;
	font-family: monospace;
	font-size: 18px;
`;

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
		<Modal isOpen={isOpen} onClose={onClose} title='Reset Password'>
			<Typography gutterBottom>
				Are you sure you want to reset the password for{' '}
				<strong>{user.username}</strong>? This will generate a new password for
				the user.
			</Typography>

			{newPassword && (
				<PasswordDisplay>New Password: {newPassword}</PasswordDisplay>
			)}

			<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
				<Button variant='secondary' onClick={onClose}>
					Cancel
				</Button>
				<Button variant='primary' onClick={onReset}>
					Reset Password
				</Button>
			</Flex>
		</Modal>
	);
};

export default ResetPasswordModal;
