import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../common/Card';
import { Container, Flex } from '../common/Layout';
import { H1, Typography } from '../common/Typography';

const Header = styled(Card)`
	margin: 0;
	border-radius: 0;
	background: ${({ theme }) => theme.colors.background.secondary};
	position: sticky;
	top: 0;
	z-index: 100;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

	&:hover {
		transform: none;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
`;

const HeaderContent = styled(Flex)`
	justify-content: space-between;
	align-items: center;
	padding: ${({ theme }) => theme.spacing.md};
`;

const Nav = styled(Flex)`
	gap: ${({ theme }) => theme.spacing.md};
`;

const NavLink = styled(Typography)<{ active?: boolean }>`
	color: ${({ active, theme }) =>
		active ? theme.colors.primary : theme.colors.text.primary};
	cursor: pointer;
	transition: color 0.2s ease;

	&:hover {
		color: ${({ theme }) => theme.colors.primary};
	}
`;

const Main = styled.main`
	flex: 1;
	padding: ${({ theme }) => theme.spacing.xl} 0;
`;

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuth();
	const currentPath = window.location.pathname;
	const isAdmin = user?.role === 'admin';

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/login');
	};

	return (
		<Flex direction='column' style={{ minHeight: '100vh' }}>
			<Header>
				<Container>
					<HeaderContent>
						<H1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
							PairFlix
						</H1>
						{isAuthenticated && (
							<Nav as='nav'>
								<NavLink
									active={currentPath === '/watchlist'}
									onClick={() => navigate('/watchlist')}
								>
									My Watchlist
								</NavLink>
								<NavLink
									active={currentPath === '/matches'}
									onClick={() => navigate('/matches')}
								>
									Matches
								</NavLink>
								{isAdmin && (
									<NavLink
										active={currentPath === '/admin/logs'}
										onClick={() => navigate('/admin/logs')}
									>
										Audit Logs
									</NavLink>
								)}
								<NavLink
									active={currentPath === '/profile'}
									onClick={() => navigate('/profile')}
								>
									Profile
								</NavLink>
								<NavLink onClick={handleLogout}>Logout</NavLink>
							</Nav>
						)}
					</HeaderContent>
				</Container>
			</Header>
			<Main>
				<Container>{children}</Container>
			</Main>
		</Flex>
	);
};

export default Layout;
