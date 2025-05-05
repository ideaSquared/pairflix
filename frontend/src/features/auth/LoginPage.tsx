import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth } from '../../services/api';

const LoginContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background: #121212;
`;

const LoginForm = styled.form`
	background: #1a1a1a;
	padding: 2rem;
	border-radius: 8px;
	width: 100%;
	max-width: 400px;
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
	width: 100%;
	padding: 0.5rem;
	background: #646cff;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	&:hover {
		background: #747bff;
	}
`;

const ErrorMessage = styled.div`
	color: #ff4444;
	margin-bottom: 1rem;
`;

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const { token } = await auth.login({ email, password });
			localStorage.setItem('token', token);
			navigate('/watchlist');
		} catch (err) {
			setError('Invalid email or password');
		}
	};

	return (
		<LoginContainer>
			<LoginForm onSubmit={handleSubmit}>
				<h2>Login to PairFlix</h2>
				{error && <ErrorMessage>{error}</ErrorMessage>}
				<Input
					type='email'
					placeholder='Email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<Input
					type='password'
					placeholder='Password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<Button type='submit'>Login</Button>
			</LoginForm>
		</LoginContainer>
	);
};

export default LoginPage;
