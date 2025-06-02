import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Container as BaseContainer } from '../common/Layout';

// Styled components for the layout
const Main = styled.main`
	flex: 1;
	width: 100%;
	padding: ${({ theme }) => theme.spacing.md} 0;
`;

export interface PageLayoutProps {
	children: ReactNode;
	fullWidth?: boolean;
	hideFooter?: boolean;
}

/**
 * PageLayout component - A base layout component for pages
 * This is a simplified version without navigation, header, or footer
 * to be used as a base component in the library
 */
const PageLayout: React.FC<PageLayoutProps> = ({
	children,
	fullWidth = false,
	hideFooter = false,
}) => {
	return (
		<Main>
			<BaseContainer
				fluid={fullWidth}
				maxWidth={fullWidth ? 'none' : 'xl'}
				centered
				fullWidth
			>
				{children}
			</BaseContainer>
		</Main>
	);
};

export default PageLayout;
