import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Flex } from '../../../components/common/Layout';
import { H3 } from '../../../components/common/Typography';
import { Theme } from '../../../styles/theme';

// Styled components for the admin dashboard
const AdminContainer = styled(Container)`
	padding: 0;
	max-width: none;
	display: flex;
	min-height: 100vh;
	position: relative;
`;

const SidebarContainer = styled.div<{ theme?: Theme }>`
	width: 250px;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border-right: 1px solid ${({ theme }) => theme.colors.border};
	position: fixed;
	left: 0;
	top: 0;
	bottom: 0;
	padding: ${({ theme }) => theme.spacing.md};
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	overflow-y: auto;
	z-index: 100;
`;

const MainContent = styled.main`
	margin-left: 250px;
	padding: ${({ theme }) => theme.spacing.lg};
	flex-grow: 1;
	width: calc(100% - 250px);
	background-color: ${({ theme }) => theme.colors.background.primary};
`;

const NavItem = styled(Link)<{ active?: boolean }>`
	display: flex;
	align-items: center;
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing.xs};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	color: ${({ theme, active }) =>
		active ? theme.colors.primary : theme.colors.text.primary};
	background-color: ${({ theme, active }) =>
		active ? `${theme.colors.primary}20` : 'transparent'};
	text-decoration: none;
	font-weight: ${({ active }) => (active ? '600' : '400')};
	transition: all 0.2s ease-in-out;

	&:hover {
		background-color: ${({ theme, active }) =>
			active ? `${theme.colors.primary}20` : theme.colors.background.secondary};
	}

	svg,
	i {
		margin-right: ${({ theme }) => theme.spacing.sm};
	}
`;

const NavSectionTitle = styled.div`
	font-size: 0.75rem;
	font-weight: 600;
	color: ${({ theme }) => theme.colors.text.secondary};
	text-transform: uppercase;
	letter-spacing: 0.05em;
	margin: ${({ theme }) => theme.spacing.md} 0
		${({ theme }) => theme.spacing.xs};
	padding: 0 ${({ theme }) => theme.spacing.md};
`;

const AdminLayout: React.FC = () => {
	const location = useLocation();

	// Helper function to check if a path is active
	const isActive = (path: string) => {
		return location.pathname.includes(path);
	};

	return (
		<AdminContainer>
			<SidebarContainer>
				<H3>Admin Dashboard</H3>
				<Flex direction='column' gap='sm'>
					<NavItem to='/admin' active={location.pathname === '/admin'}>
						<i className='fas fa-tachometer-alt'></i> Dashboard
					</NavItem>

					<NavSectionTitle>Management</NavSectionTitle>
					<NavItem to='/admin/users' active={isActive('/admin/users')}>
						<i className='fas fa-users'></i> Users
					</NavItem>
					<NavItem to='/admin/activity' active={isActive('/admin/activity')}>
						<i className='fas fa-list-alt'></i> Activity & Logs
					</NavItem>

					<NavSectionTitle>System</NavSectionTitle>
					<NavItem to='/admin/settings' active={isActive('/admin/settings')}>
						<i className='fas fa-cog'></i> Settings
					</NavItem>
				</Flex>
			</SidebarContainer>
			<MainContent>
				<Outlet />
			</MainContent>
		</AdminContainer>
	);
};

export default AdminLayout;
