import { H1 } from '@pairflix/components';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useSettings } from '../../contexts/SettingsContext';

const HeaderContainer = styled.header`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: ${({ theme }) => theme.spacing.md};
	background-color: ${({ theme }) => theme.colors.background.secondary};
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

	@media (max-width: 768px) {
		padding: ${({ theme }) => theme.spacing.sm};
		flex-wrap: wrap;
	}
`;

const Logo = styled(H1)`
	margin: 0;

	@media (max-width: 768px) {
		font-size: ${({ theme }) => theme.typography.fontSize.lg};
	}
`;

const Navigation = styled.nav<{ $isOpen: boolean }>`
	display: flex;
	gap: ${({ theme }) => theme.spacing.md};

	@media (max-width: 768px) {
		flex-direction: column;
		position: absolute;
		top: ${(props) => (props.$isOpen ? '60px' : '-400px')};
		left: 0;
		right: 0;
		background-color: ${({ theme }) => theme.colors.background.secondary};
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		padding: ${({ theme }) => theme.spacing.md};
		gap: ${({ theme }) => theme.spacing.md};
		z-index: 100;
		transition: top 0.3s ease-in-out;
	}
`;

const NavLink = styled(Link)`
	color: ${({ theme }) => theme.colors.text.primary};
	text-decoration: none;
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	transition: color 0.2s ease-in-out;

	&:hover {
		color: ${({ theme }) => theme.colors.primary.main};
	}

	@media (max-width: 768px) {
		padding: ${({ theme }) => theme.spacing.sm} 0;
		border-bottom: 1px solid ${({ theme }) => theme.colors.border};
		display: block;
		width: 100%;
	}
`;

const MenuButton = styled.button`
	display: none;
	background: none;
	border: none;
	color: ${({ theme }) => theme.colors.text.primary};
	font-size: ${({ theme }) => theme.typography.fontSize.lg};
	cursor: pointer;
	padding: ${({ theme }) => theme.spacing.xs};

	@media (max-width: 768px) {
		display: block;
	}
`;

const DesktopOnly = styled.div`
	@media (max-width: 768px) {
		display: none;
	}
`;

const Header: React.FC = () => {
	const { settings, isLoading } = useSettings();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const toggleMenu = () => {
		setMobileMenuOpen((prev) => !prev);
	};

	const closeMenu = () => {
		setMobileMenuOpen(false);
	};

	return (
		<HeaderContainer>
			<Logo>
				{isLoading ? 'Loading...' : settings?.general.siteName || 'PairFlix'}
			</Logo>

			<MenuButton
				onClick={toggleMenu}
				aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
			>
				{mobileMenuOpen ? '✕' : '☰'}
			</MenuButton>

			<Navigation $isOpen={mobileMenuOpen}>
				<NavLink to='/' onClick={closeMenu}>
					Home
				</NavLink>
				<NavLink to='/matches' onClick={closeMenu}>
					Matches
				</NavLink>
				<NavLink to='/watchlist' onClick={closeMenu}>
					Watchlist
				</NavLink>
				<NavLink to='/activity' onClick={closeMenu}>
					Activity
				</NavLink>
				<NavLink to='/profile' onClick={closeMenu}>
					Profile
				</NavLink>
				{/* Only show admin link if features are enabled */}
				{settings?.features.enableUserProfiles && (
					<NavLink to='/admin' onClick={closeMenu}>
						Admin
					</NavLink>
				)}
			</Navigation>
		</HeaderContainer>
	);
};

export default Header;
