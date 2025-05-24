import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export const AdminLoginPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { login, isAuthenticated } = useAdminAuth();
	const navigate = useNavigate();

	// Redirect if already logged in
	if (isAuthenticated) {
		navigate('/admin');
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
			await login(email, password);
			navigate('/admin');
		} catch (err) {
			setError('Invalid email or password');
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
