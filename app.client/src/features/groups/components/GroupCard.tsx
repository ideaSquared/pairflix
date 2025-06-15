import { Card } from '@pairflix/components';
import { Link } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import type { Group } from '../../../types/group';
import { getGroupTypeColor } from '../utils/groupHelpers';
import {
  GroupActionHint,
  GroupCreator,
  GroupDescription,
  GroupHeader,
  GroupSchedule,
  GroupStats,
} from './ui';

interface GroupCardProps {
  group: Group;
  onClick?: (group: Group) => void;
  className?: string;
}

// Styled components
const GroupContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.xl || '2rem'};
`;

const ClickableWrapper = styled.div`
  cursor: pointer;
`;

const StyledLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
`;

export default function GroupCard({
  group,
  onClick,
  className = '',
}: GroupCardProps) {
  const theme = useTheme();

  const handleCardClick = () => {
    if (onClick) {
      onClick(group);
    }
  };

  const cardContent = (
    <Card
      variant="outlined"
      elevation="medium"
      isInteractive={!onClick}
      accentColor={getGroupTypeColor(group.type, theme)}
      className={className}
    >
      <GroupContent>
        <GroupHeader group={group} />
        <GroupDescription group={group} />
        <GroupStats group={group} />
        <GroupCreator group={group} />
        <GroupSchedule group={group} />
        <GroupActionHint show={!onClick} />
      </GroupContent>
    </Card>
  );

  // If onClick is provided, render as clickable div
  if (onClick) {
    return (
      <ClickableWrapper onClick={handleCardClick}>
        {cardContent}
      </ClickableWrapper>
    );
  }

  // Otherwise, wrap with Link for navigation
  return (
    <StyledLink to={`/groups/${group.group_id}`}>{cardContent}</StyledLink>
  );
}
