import React from 'react';
import styled from 'styled-components';
import { Typography } from '@pairflix/components';

interface PageHeaderProps {
	title: string;
	description?: string;
	icon?: string;
}

const HeaderContainer = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const HeaderTitle = styled.h1`
	font-size: 1.75rem;
	font-weight: 600;
	margin-bottom: ${({ theme }) => theme.spacing.sm};
	display: flex;
	align-items: center;
`;

const IconWrapper = styled.span`
	margin-right: ${({ theme }) => theme.spacing.sm};
`;

export const PageHeader: React.FC<PageHeaderProps> = ({
	title,
	description,
	icon,
}) => {
	return (
		<HeaderContainer>
			<HeaderTitle>
				{icon && (
					<IconWrapper>
						<i className={icon}></i>
					</IconWrapper>
				)}
				{title}
			</HeaderTitle>
			{description && <Typography variant='body1'>{description}</Typography>}
		</HeaderContainer>
	);
};

export default PageHeader;
