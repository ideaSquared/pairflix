import { Button, Card, CardContent, ErrorText, H2, Input, InputGroup } from '@pairflix/components'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
;
;
;
;
import { Container } from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../services/api';

const LoginContainer = styled(Container)`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background: ${({ theme }) => theme.colors.background.primary};
`;

const LoginCard = styled(Card)`
	width: 100%;
	max-width: 400px;
`;

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const { checkAuth } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const { token } = await auth.login({ email, password });
			localStorage.setItem('token', token);
			checkAuth();
			navigate('/watchlist');
		} catch (err) {
			// Extract the specific error message from the response if available
			if (err instanceof Error) {
				setError(err.message);
			} else if (typeof err === 'object' && err !== null && 'message' in err) {
				setError(err.message as string);
			} else {
				setError('Invalid email or password');
			}
		}
	};

	return (
		<LoginContainer maxWidth='sm'>
			<LoginCard>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<H2 gutterBottom>Login to PairFlix</H2>
						{error && <ErrorText gutterBottom>{error}</ErrorText>}

						<InputGroup fullWidth>
							<Input
								type='email'
								placeholder='Email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								fullWidth
							/>
						</InputGroup>

						<InputGroup fullWidth>
							<Input
								type='password'
								placeholder='Password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								fullWidth
							/>
						</InputGroup>

						<Button type='submit' variant='primary' fullWidth>
							Login
						</Button>
					</form>
				</CardContent>
			</LoginCard>
		</LoginContainer>
	);
};

export default LoginPage;
