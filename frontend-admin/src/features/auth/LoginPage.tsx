import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export const LoginPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { login, isAuthenticated, checkAuth } = useAdminAuth();
	const navigate = useNavigate();

	// Redirect if already logged in
	if (isAuthenticated) {
		navigate('/dashboard');
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!email || !password) {
			setError('Please enter both email and password');
			return;
		}

		try {
			setIsSubmitting(true);

			// Login and get token
			await login(email, password);

			// Verify the token was properly saved
			const savedToken = localStorage.getItem('admin_token');
			if (!savedToken) {
				throw new Error('Failed to save authentication token');
			}

			// Verify authentication state is updated
			await checkAuth();

			// Navigate only after successful authentication
			navigate('/dashboard');
		} catch (err) {
			console.error('Login error:', err);
			setError(
				err instanceof Error ? err.message : 'Invalid email or password'
			);

			// Clear any potentially corrupted token
			localStorage.removeItem('admin_token');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
				backgroundColor: 'var(--background-light)',
			}}
		>
			<div className='admin-card' style={{ width: '400px', maxWidth: '90%' }}>
				<h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
					PairFlix Admin
				</h1>

				{error && <div className='alert alert-error'>{error}</div>}

				<form onSubmit={handleSubmit}>
					<div className='form-group'>
						<label htmlFor='email'>Email</label>
						<input
							type='email'
							id='email'
							className='form-control'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isSubmitting}
							autoComplete='email'
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='password'>Password</label>
						<input
							type='password'
							id='password'
							className='form-control'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={isSubmitting}
							autoComplete='current-password'
						/>
					</div>

					<button
						type='submit'
						className='btn btn-primary'
						style={{ width: '100%' }}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Logging in...' : 'Log In'}
					</button>
				</form>
			</div>
		</div>
	);
};
