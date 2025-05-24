import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';

// Styled components for the admin dashboard
const AdminContainer = styled.div`
	padding: 0;
	max-width: none;
	display: flex;
	min-height: 100vh;
	position: relative;
`;

const SidebarContainer = styled.div`
	width: 250px;
	background-color: #1a1a1a;
	border-right: 1px solid #2a2a2a;
	position: fixed;
	left: 0;
	top: 0;
	bottom: 0;
	padding: 1rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	overflow-y: auto;
	z-index: 100;
`;

const MainContent = styled.main`
	margin-left: 250px;
	padding: 2rem;
	flex-grow: 1;
	width: calc(100% - 250px);
	background-color: #121212;
`;

const NavItem = styled(Link)<{ active?: boolean }>`
	display: flex;
	align-items: center;
	padding: 0.75rem 1rem;
	margin-bottom: 0.25rem;
	border-radius: 0.25rem;
	color: ${({ active }) => (active ? '#ffffff' : '#b3b3b3')};
	background-color: ${({ active }) =>
		active ? 'rgba(66, 133, 244, 0.15)' : 'transparent'};
	text-decoration: none;
	font-weight: ${({ active }) => (active ? '600' : '400')};
	transition: all 0.2s ease-in-out;

	&:hover {
		background-color: ${({ active }) =>
			active ? 'rgba(66, 133, 244, 0.15)' : '#2a2a2a'};
	}

	i {
		margin-right: 0.5rem;
		width: 20px;
		text-align: center;
	}
`;

const NavSectionTitle = styled.div`
	font-size: 0.75rem;
	font-weight: 600;
	color: #6c757d;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	margin: 1.5rem 0 0.5rem;
	padding: 0 0.75rem;
`;

const HeaderTitle = styled.h3`
	color: #ffffff;
	margin-bottom: 2rem;
	font-size: 1.5rem;
`;

export const AdminLayout: React.FC = () => {
	const location = useLocation();

	// Helper function to check if a path is active
	const isActive = (path: string) => {
		return (
			location.pathname === path || location.pathname.startsWith(`${path}/`)
		);
	};

	return (
		<AdminContainer>
			<SidebarContainer>
				<HeaderTitle>Admin Dashboard</HeaderTitle>
				<nav>
					<NavItem to='/admin' active={location.pathname === '/admin'}>
						<i className='fas fa-tachometer-alt'></i> Dashboard
					</NavItem>

					<NavSectionTitle>Management</NavSectionTitle>

					<NavItem to='/admin/users' active={isActive('/admin/users')}>
						<i className='fas fa-users'></i> Users
					</NavItem>

					<NavItem to='/admin/content' active={isActive('/admin/content')}>
						<i className='fas fa-film'></i> Content
					</NavItem>

					<NavItem to='/admin/activity' active={isActive('/admin/activity')}>
						<i className='fas fa-list-alt'></i> Activity & Logs
					</NavItem>

					<NavSectionTitle>System</NavSectionTitle>

					<NavItem
						to='/admin/monitoring'
						active={isActive('/admin/monitoring')}
					>
						<i className='fas fa-heartbeat'></i> Monitoring
					</NavItem>

					<NavItem to='/admin/settings' active={isActive('/admin/settings')}>
						<i className='fas fa-cog'></i> Settings
					</NavItem>
				</nav>
			</SidebarContainer>

			<MainContent>
				<Outlet />
			</MainContent>
		</AdminContainer>
	);
};
