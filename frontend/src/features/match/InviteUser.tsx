import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import styled from 'styled-components';
import { matches, user } from '../../services/api';

const Form = styled.form`
	background: #1a1a1a;
	padding: 1rem;
	border-radius: 8px;
	margin-bottom: 1rem;
	max-width: 100%;
`;

const Input = styled.input`
	width: 100%;
	padding: 0.5rem;
	margin-bottom: 1rem;
	background: #2a2a2a;
	border: 1px solid #3a3a3a;
	border-radius: 4px;
	color: white;
`;

const Button = styled.button`
	background: #646cff;
	color: white;
	border: none;
	border-radius: 4px;
	padding: 0.5rem 1rem;
	cursor: pointer;
	&:hover {
		background: #747bff;
	}
	&:disabled {
		background: #4a4a4a;
		cursor: not-allowed;
	}
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 0.5rem;

	@media (max-width: 480px) {
		flex-direction: column;
	}
`;

const ErrorMessage = styled.div`
	color: #ff4444;
	margin-bottom: 1rem;
`;

interface Props {
	onSuccess?: () => void;
}

const InviteUser: React.FC<Props> = ({ onSuccess }) => {
	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	const queryClient = useQueryClient();

	const createMatchMutation = useMutation(
		async (email: string) => {
			// First find the user by email
			const foundUser = await user.findByEmail(email);
			// Then create the match with the found user's ID
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
		<Form onSubmit={handleSubmit}>
			<h3>Invite a User</h3>
			{error && <ErrorMessage>{error}</ErrorMessage>}
			<Input
				type='email'
				placeholder="Enter user's email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
			/>
			<ButtonGroup>
				<Button type='submit' disabled={createMatchMutation.isLoading}>
					{createMatchMutation.isLoading ? 'Sending...' : 'Send Invite'}
				</Button>
			</ButtonGroup>
		</Form>
	);
};

export default InviteUser;
