import { Button, Card, CardContent, ErrorText, H3, Input, InputGroup } from '@pairflix/components'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
;
;
;
;
import { matches, user } from '../../services/api';

interface Props {
	onSuccess?: () => void;
}

const InviteUser: React.FC<Props> = ({ onSuccess }) => {
	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	const queryClient = useQueryClient();

	const createMatchMutation = useMutation(
		async (email: string) => {
			const foundUser = await user.findByEmail(email);
			return matches.create(foundUser.user_id);
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['matches']);
				setEmail('');
				setError('');
				onSuccess?.();
			},
			onError: (err: Error) => {
				setError(err.message || 'Failed to send invite');
			},
		}
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) {
			setError('Please enter an email address');
			return;
		}
		createMatchMutation.mutate(email);
	};

	return (
		<Card variant='primary'>
			<CardContent>
				<form onSubmit={handleSubmit}>
					<H3 gutterBottom>Invite a User</H3>
					{error && <ErrorText gutterBottom>{error}</ErrorText>}

					<InputGroup fullWidth>
						<Input
							type='email'
							placeholder="Enter user's email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							fullWidth
						/>
					</InputGroup>

					<Button
						type='submit'
						variant='primary'
						disabled={createMatchMutation.isLoading}
						fullWidth
					>
						{createMatchMutation.isLoading ? 'Sending...' : 'Send Invite'}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};

export default InviteUser;
