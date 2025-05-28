import React, { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import type { Theme } from '../../styles/theme';
import { Card } from '../common/Card';
import { H1, Typography } from '../common/Typography';

// ======== Layout Utility Components ========

// Define responsive breakpoints
export const breakpoints = {
	xs: '375px', // Small mobile
	sm: '576px', // Mobile
	md: '768px', // Tablet
	lg: '992px', // Small desktop
	xl: '1200px', // Desktop
	xxl: '1600px', // Large desktop
};

// Media query helpers for better readability
export const media = {
	mobile: `(max-width: ${breakpoints.sm})`,
	tablet: `(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`,
	desktop: `(min-width: ${breakpoints.lg})`,
	largeDesktop: `(min-width: ${breakpoints.xxl})`,
};

// Define Grid component props
interface GridProps {
	columns?: number | string;
	gap?: keyof Theme['spacing'];
	alignItems?: 'start' | 'center' | 'end' | 'stretch';
	justifyContent?:
		| 'start'
		| 'center'
		| 'end'
		| 'space-between'
		| 'space-around'
		| 'flex-start'
		| 'flex-end';
	mobileColumns?: number | string; // Mobile-specific columns
	tabletColumns?: number | string; // Tablet-specific columns
	desktopColumns?: number | string; // Desktop-specific columns
}

export const Grid = styled.div<GridProps>`
	display: grid;
	grid-template-columns: ${({ columns = 1 }) =>
		typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns};
	gap: ${({ gap = 'md', theme }) => theme.spacing[gap]};
	align-items: ${({ alignItems = 'stretch' }) => alignItems};
	justify-content: ${({ justifyContent = 'start' }) => justifyContent};

	/* Responsive grid layouts */
	@media ${media.largeDesktop} {
		grid-template-columns: ${({ desktopColumns, columns = 1 }) =>
			desktopColumns
				? typeof desktopColumns === 'number'
					? `repeat(${desktopColumns}, 1fr)`
					: desktopColumns
				: typeof columns === 'number'
					? `repeat(${columns}, 1fr)`
					: columns};
	}

	@media ${media.desktop} {
		grid-template-columns: ${({ desktopColumns, columns = 1 }) =>
			desktopColumns
				? typeof desktopColumns === 'number'
					? `repeat(${desktopColumns}, 1fr)`
					: desktopColumns
				: typeof columns === 'number'
					? `repeat(${columns}, 1fr)`
					: columns};
	}

	@media ${media.tablet} {
		grid-template-columns: ${({ tabletColumns, columns = 1 }) =>
			tabletColumns
				? typeof tabletColumns === 'number'
					? `repeat(${tabletColumns}, 1fr)`
					: tabletColumns
				: typeof columns === 'number'
					? `repeat(${Math.min(columns as number, 2)}, 1fr)`
					: columns};
	}

	@media ${media.mobile} {
		grid-template-columns: ${({ mobileColumns }) =>
			mobileColumns
				? typeof mobileColumns === 'number'
					? `repeat(${mobileColumns}, 1fr)`
					: mobileColumns
				: '1fr'};
	}
`;

interface ContainerProps {
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'none';
	padding?: keyof Theme['spacing'];
	fluid?: boolean; // Whether container should be fluid width
	centered?: boolean; // Whether container should be centered
	fullWidth?: boolean; // Whether container should take full width of parent
	children: ReactNode;
}

export const Container = styled.div<ContainerProps>`
	width: ${({ fullWidth = true }) => (fullWidth ? '100%' : 'auto')};
	margin-left: ${({ centered = true }) => (centered ? 'auto' : '0')};
	margin-right: ${({ centered = true }) => (centered ? 'auto' : '0')};
	padding-left: ${({ padding = 'md', theme }) => theme.spacing[padding]};
	padding-right: ${({ padding = 'md', theme }) => theme.spacing[padding]};

	/* Max-width is applied only when not fluid */
	max-width: ${({ maxWidth = 'lg', fluid = false, theme }) =>
		fluid
			? '100%'
			: maxWidth === 'none'
				? 'none'
				: theme.breakpoints[maxWidth]};

	/* Responsive padding adjustments */
	@media ${media.mobile} {
		padding-left: ${({ padding = 'md', theme }) =>
			padding === 'xs' ? theme.spacing.xs : theme.spacing.sm};
		padding-right: ${({ padding = 'md', theme }) =>
			padding === 'xs' ? theme.spacing.xs : theme.spacing.sm};
	}
`;

interface FlexProps {
	direction?: 'row' | 'column';
	gap?: keyof Theme['spacing'];
	alignItems?:
		| 'start'
		| 'center'
		| 'end'
		| 'stretch'
		| 'flex-start'
		| 'flex-end';
	justifyContent?:
		| 'start'
		| 'center'
		| 'end'
		| 'space-between'
		| 'space-around'
		| 'space-evenly'
		| 'flex-start'
		| 'flex-end';
	wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
	mobileDirection?: 'row' | 'column'; // Direction on mobile
	tabletDirection?: 'row' | 'column'; // Direction on tablet
	mobileGap?: keyof Theme['spacing']; // Gap on mobile
	fullWidth?: boolean; // Whether to take full width
	fullHeight?: boolean; // Whether to take full height
}

export const Flex = styled.div<FlexProps>`
	display: flex;
	flex-direction: ${({ direction = 'row' }) => direction};
	gap: ${({ gap = 'md', theme }) => theme.spacing[gap]};
	align-items: ${({ alignItems = 'stretch' }) => alignItems};
	justify-content: ${({ justifyContent = 'start' }) => justifyContent};
	flex-wrap: ${({ wrap = 'nowrap' }) => wrap};
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	height: ${({ fullHeight }) => (fullHeight ? '100%' : 'auto')};

	/* Responsive adjustments */
	@media ${media.tablet} {
		flex-direction: ${({ tabletDirection, direction = 'row' }) =>
			tabletDirection || direction};
	}

	@media ${media.mobile} {
		flex-direction: ${({ mobileDirection, direction = 'row' }) =>
			mobileDirection || (direction === 'row' ? 'column' : direction)};
		gap: ${({ mobileGap, gap = 'md', theme }) =>
			theme.spacing[mobileGap || (gap === 'lg' || gap === 'xl' ? 'md' : gap)]};

		/* Common pattern: Row on desktop becomes column on mobile */
		${({ direction }) =>
			direction === 'row' &&
			!css`
				& > * {
					width: 100%;
				}
			`}
	}
`;

export const Spacer = styled.div<{
	size: keyof Theme['spacing'];
	responsive?: boolean;
}>`
	height: ${({ size, theme }) => theme.spacing[size]};
	width: ${({ size, theme }) => theme.spacing[size]};

	/* Responsive spacer that gets smaller on mobile */
	${({ responsive, size, theme }) =>
		responsive &&
		css`
			@media ${media.mobile} {
				height: ${size === 'xl' || size === 'lg'
					? theme.spacing.md
					: size === 'md'
						? theme.spacing.sm
						: theme.spacing.xs};
				width: ${size === 'xl' || size === 'lg'
					? theme.spacing.md
					: size === 'md'
						? theme.spacing.sm
						: theme.spacing.xs};
			}
		`}
`;

export const Section = styled.section<{
	spacing?: keyof Theme['spacing'];
	fullWidth?: boolean;
}>`
	padding-top: ${({ spacing = 'xl', theme }) => theme.spacing[spacing]};
	padding-bottom: ${({ spacing = 'xl', theme }) => theme.spacing[spacing]};
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

	@media ${media.mobile} {
		padding-top: ${({ spacing = 'xl', theme }) =>
			spacing === 'xl' ? theme.spacing.lg : theme.spacing.md};
		padding-bottom: ${({ spacing = 'xl', theme }) =>
			spacing === 'xl' ? theme.spacing.lg : theme.spacing.md};
	}
`;

// ======== Main Layout Component ========

const Header = styled(Card)`
	margin: 0;
	border-radius: 0;
	background: ${({ theme }) => theme.colors.background.secondary};
	position: sticky;
	top: 0;
	z-index: 100;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	width: 100%;

	&:hover {
		transform: none;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
`;

const HeaderContent = styled(Flex)`
	justify-content: space-between;
	align-items: center;
	padding: ${({ theme }) => theme.spacing.md};

	@media ${media.mobile} {
		padding: ${({ theme }) => theme.spacing.sm}
			${({ theme }) => theme.spacing.md};
	}
`;

const AppTitle = styled(H1)`
	font-size: ${({ theme }) => theme.typography.fontSize.xl};
	margin: 0;

	@media ${media.mobile} {
		font-size: ${({ theme }) => theme.typography.fontSize.lg};
	}
`;

const Nav = styled(Flex)`
	gap: ${({ theme }) => theme.spacing.md};

	@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
		display: none; /* Hide standard nav on mobile */
	}
`;

const MobileMenuButton = styled.button`
	display: none;
	background: none;
	border: none;
	color: ${({ theme }) => theme.colors.text.primary};
	font-size: 1.5rem;
	cursor: pointer;
	padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
	border-radius: ${({ theme }) => theme.borderRadius.sm};

	&:hover {
		background: ${({ theme }) => theme.colors.background.tertiary};
	}

	&:focus {
		outline: 2px solid ${({ theme }) => theme.colors.primary};
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
		display: flex;
		align-items: center;
		justify-content: center;
	}
`;

// Mobile navigation menu
const MobileMenuOverlay = styled.div<{ open: boolean }>`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 150;
	opacity: ${({ open }) => (open ? 1 : 0)};
	visibility: ${({ open }) => (open ? 'visible' : 'hidden')};
	transition:
		opacity 0.3s ease,
		visibility 0.3s ease;
`;

const MobileMenuContainer = styled.div<{ open: boolean }>`
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	width: 80%;
	max-width: 320px;
	background: ${({ theme }) => theme.colors.background.primary};
	z-index: 200;
	transform: ${({ open }) => (open ? 'translateX(0)' : 'translateX(100%)')};
	transition: transform 0.3s ease;
	display: flex;
	flex-direction: column;
	box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
	padding: ${({ theme }) => theme.spacing.lg} 0;
`;

const MobileNavHeader = styled.div`
	padding: 0 ${({ theme }) => theme.spacing.md}
		${({ theme }) => theme.spacing.md};
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const MobileNavClose = styled.button`
	background: none;
	border: none;
	font-size: 1.5rem;
	color: ${({ theme }) => theme.colors.text.primary};
	cursor: pointer;
	padding: ${({ theme }) => theme.spacing.xs};
`;

const MobileNavLinks = styled.nav`
	display: flex;
	flex-direction: column;
	padding: ${({ theme }) => theme.spacing.md};
	flex: 1;
`;

const MobileNavLink = styled(Typography)<{ active?: boolean }>`
	padding: ${({ theme }) => theme.spacing.md} 0;
	color: ${({ active, theme }) =>
		active ? theme.colors.primary : theme.colors.text.primary};
	cursor: pointer;
	font-weight: ${({ active, theme }) =>
		active
			? theme.typography.fontWeight.bold
			: theme.typography.fontWeight.medium};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};

	&:last-child {
		border-bottom: none;
		margin-top: auto; /* Push logout to bottom */
	}

	&:hover {
		color: ${({ theme }) => theme.colors.primary};
	}
`;

const NavLink = styled(Typography)<{ active?: boolean }>`
	color: ${({ active, theme }) =>
		active ? theme.colors.primary : theme.colors.text.primary};
	cursor: pointer;
	transition: color 0.2s ease;
	font-weight: ${({ active, theme }) =>
		active
			? theme.typography.fontWeight.bold
			: theme.typography.fontWeight.medium};

	&:hover {
		color: ${({ theme }) => theme.colors.primary};
	}
`;

const Main = styled.main`
	flex: 1;
	width: 100%;
	padding: ${({ theme }) => theme.spacing.xl} 0;

	@media ${media.mobile} {
		padding: ${({ theme }) => theme.spacing.md} 0;
	}
`;

// Responsive footer component
const Footer = styled.footer`
	background: ${({ theme }) => theme.colors.background.secondary};
	padding: ${({ theme }) => theme.spacing.lg} 0;
	margin-top: auto;

	@media ${media.mobile} {
		padding: ${({ theme }) => theme.spacing.md} 0;
	}
`;

const FooterContent = styled(Container)`
	display: flex;
	justify-content: space-between;
	align-items: center;

	@media ${media.mobile} {
		flex-direction: column;
		gap: ${({ theme }) => theme.spacing.md};
		text-align: center;
	}
`;

const FooterLinks = styled(Flex)`
	gap: ${({ theme }) => theme.spacing.md};

	@media ${media.mobile} {
		flex-direction: column;
		gap: ${({ theme }) => theme.spacing.sm};
	}
`;

const FooterLink = styled(Typography)`
	color: ${({ theme }) => theme.colors.text.secondary};
	cursor: pointer;
	font-size: ${({ theme }) => theme.typography.fontSize.sm};

	&:hover {
		color: ${({ theme }) => theme.colors.primary};
	}
`;

const Copyright = styled(Typography)`
	color: ${({ theme }) => theme.colors.text.secondary};
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

interface LayoutProps {
	children: React.ReactNode;
	fullWidth?: boolean;
	hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
	children,
	fullWidth = false,
	hideFooter = false,
}) => {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuth();
	const currentPath = window.location.pathname;

	// Mobile menu state
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/login');
	};

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setMobileMenuOpen(false);
	};

	// Navigation handler with mobile menu close
	const handleNavigate = (path: string) => {
		navigate(path);
		closeMobileMenu();
	};

	return (
		<Flex direction='column' style={{ minHeight: '100vh', width: '100%' }}>
			<Header>
				<Container fluid>
					<HeaderContent>
						<AppTitle
							onClick={() => navigate('/')}
							style={{ cursor: 'pointer' }}
						>
							PairFlix
						</AppTitle>
						{isAuthenticated && (
							<>
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
									<NavLink
										active={currentPath === '/profile'}
										onClick={() => navigate('/profile')}
									>
										Profile
									</NavLink>
									<NavLink onClick={handleLogout}>Logout</NavLink>
								</Nav>

								{/* Mobile menu button */}
								<MobileMenuButton
									onClick={toggleMobileMenu}
									aria-label='Menu'
									aria-expanded={mobileMenuOpen}
								>
									☰
								</MobileMenuButton>

								{/* Mobile navigation menu */}
								<MobileMenuOverlay
									open={mobileMenuOpen}
									onClick={closeMobileMenu}
								/>
								<MobileMenuContainer
									open={mobileMenuOpen}
									role='dialog'
									aria-modal='true'
								>
									<MobileNavHeader>
										<AppTitle>PairFlix</AppTitle>
										<MobileNavClose
											onClick={closeMobileMenu}
											aria-label='Close menu'
										>
											×
										</MobileNavClose>
									</MobileNavHeader>
									<MobileNavLinks>
										<MobileNavLink
											active={currentPath === '/watchlist'}
											onClick={() => handleNavigate('/watchlist')}
										>
											My Watchlist
										</MobileNavLink>
										<MobileNavLink
											active={currentPath === '/matches'}
											onClick={() => handleNavigate('/matches')}
										>
											Matches
										</MobileNavLink>
										<MobileNavLink
											active={currentPath === '/profile'}
											onClick={() => handleNavigate('/profile')}
										>
											Profile
										</MobileNavLink>
										<MobileNavLink onClick={handleLogout}>Logout</MobileNavLink>
									</MobileNavLinks>
								</MobileMenuContainer>
							</>
						)}
					</HeaderContent>
				</Container>
			</Header>
			<Main>
				<Container fluid={fullWidth} maxWidth={fullWidth ? 'none' : 'xxl'}>
					{children}
				</Container>
			</Main>

			{!hideFooter && (
				<Footer>
					<FooterContent fluid>
						<Copyright>© 2025 PairFlix. All rights reserved.</Copyright>
						<FooterLinks>
							<FooterLink onClick={() => navigate('/terms')}>
								Terms of Service
							</FooterLink>
							<FooterLink onClick={() => navigate('/privacy')}>
								Privacy Policy
							</FooterLink>
							<FooterLink onClick={() => navigate('/contact')}>
								Contact Us
							</FooterLink>
						</FooterLinks>
					</FooterContent>
				</Footer>
			)}
		</Flex>
	);
};

export default Layout;
