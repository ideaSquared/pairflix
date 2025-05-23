import React from 'react';
import styled from 'styled-components';
import { H1, Typography } from './Typography';

const MaintenanceContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
	padding: ${({ theme }) => theme.spacing.xl};
	text-align: center;
	background-color: ${({ theme }) => theme.colors.background.primary};
`;

const MaintenanceIcon = styled.div`
	font-size: 4rem;
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MaintenanceMode: React.FC = () => {
	return (
		<MaintenanceContainer>
			<MaintenanceIcon>🛠️</MaintenanceIcon>
			<H1 gutterBottom>Site Maintenance</H1>
			<Typography>
				We're currently performing scheduled maintenance to improve your
				experience. Please check back shortly. We apologize for the
				inconvenience.
			</Typography>
		</MaintenanceContainer>
	);
};

export default MaintenanceMode;
