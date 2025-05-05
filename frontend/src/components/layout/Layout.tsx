import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const LayoutContainer = styled.div`
	min-height: 100vh;
	display: flex;
	flex-direction: column;
`;

const Header = styled.header`
	background: #1a1a1a;
	padding: 1rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const Nav = styled.nav`
	display: flex;
	gap: 1rem;
`;

const NavLink = styled.a`
	color: white;
	text-decoration: none;
	cursor: pointer;
	&:hover {
		color: #646cff;
	}
`;

const Main = styled.main`
	flex: 1;
	padding: 2rem;
`;

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const navigate = useNavigate();
	const token = localStorage.getItem('token');

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/login');
	};

	return (
		<LayoutContainer>
			<Header>
				<h1>PairFlix</h1>
				{token && (
					<Nav>
						<NavLink onClick={() => navigate('/watchlist')}>
							My Watchlist
						</NavLink>
						<NavLink onClick={() => navigate('/matches')}>Matches</NavLink>
						<NavLink onClick={handleLogout}>Logout</NavLink>
					</Nav>
				)}
			</Header>
			<Main>{children}</Main>
		</LayoutContainer>
	);
};

export default Layout;
