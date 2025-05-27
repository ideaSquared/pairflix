import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { H1 } from '../components/common/Typography';

const NotFoundContainer = styled.div`
	text-align: center;
	padding: ${({ theme }) => theme.spacing.xl};
`;

const NotFoundText = styled.p`
	margin: ${({ theme }) => theme.spacing.lg} 0;
	font-size: 1.1rem;
	color: ${({ theme }) => theme.colors.text.secondary};
`;

const BackLink = styled(Link)`
	display: inline-block;
	color: ${({ theme }) => theme.colors.primary.main};
	text-decoration: none;
	margin-top: ${({ theme }) => theme.spacing.md};

	&:hover {
		text-decoration: underline;
	}
`;

const NotFound: React.FC = () => {
	return (
		<NotFoundContainer>
			<H1>404 - Page Not Found</H1>
			<NotFoundText>
				The page you are looking for does not exist or has been moved.
			</NotFoundText>
			<BackLink to='/'>
				<i className='fas fa-arrow-left' style={{ marginRight: '8px' }}></i>
				Return to Dashboard
			</BackLink>
		</NotFoundContainer>
	);
};

export default NotFound;
