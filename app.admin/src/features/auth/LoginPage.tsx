import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../components/common/Button';
import { Card, CardContent } from '../../components/common/Card';
import { Input, InputGroup } from '../../components/common/Input';
import { Container } from '../../components/common/Layout';
import { ErrorText, H2 } from '../../components/common/Typography';
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
			const response = await auth.login({ email, password });
			localStorage.setItem('token', response.token);
			localStorage.setItem('user', JSON.stringify(response.user));
			await checkAuth();
			navigate('/dashboard');
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('Login failed. Please check your credentials and try again.');
			}
		}
	};

	return (
		<LoginContainer maxWidth='sm'>
			<LoginCard>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<H2 gutterBottom>Admin Login</H2>
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
