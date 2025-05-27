import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../hooks/useAuth';
import { H1 } from '../common/Typography';

const HeaderContainer = styled.header`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: ${({ theme }) => theme.spacing.md};
	background-color: ${({ theme }) => theme.colors.background.secondary};
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(H1)`
	margin: 0;
`;

const Navigation = styled.nav`
	display: flex;
	gap: ${({ theme }) => theme.spacing.md};
`;

const NavLink = styled(Link)`
	color: ${({ theme }) => theme.colors.text.primary};
	text-decoration: none;
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	transition: color 0.2s ease-in-out;

	&:hover {
		color: ${({ theme }) => theme.colors.primary.main};
	}
`;

const Header: React.FC = () => {
	const { settings, isLoading } = useSettings();
	const { user, logout } = useAuth();

	return (
		<HeaderContainer>
			<Logo>
				{isLoading ? 'Loading...' : settings?.general.siteName || 'PairFlix'}{' '}
				Admin
			</Logo>
			<Navigation>
				<NavLink to='/'>Dashboard</NavLink>
				<NavLink to='/users'>Users</NavLink>
				<NavLink to='/content'>Content</NavLink>
				<NavLink to='/monitoring'>Monitoring</NavLink>
				<NavLink to='/activity'>Activity</NavLink>
				<NavLink to='/logs'>Logs</NavLink>
				<NavLink to='/stats'>Stats</NavLink>
				<NavLink to='/settings'>Settings</NavLink>
				{user && (
					<NavLink
						to='#'
						onClick={(e) => {
							e.preventDefault();
							logout();
						}}
					>
						Logout
					</NavLink>
				)}
			</Navigation>
		</HeaderContainer>
	);
};

export default Header;
