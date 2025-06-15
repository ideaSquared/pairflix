import { Badge } from '@pairflix/components';
import { HiFilm, HiHeart, HiUsers } from 'react-icons/hi2';
import styled from 'styled-components';
import type { Group, GroupType } from '../../../../types/group';

interface GroupHeaderProps {
  group: Group;
}

// Styled components
const HeaderSection = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
  flex: 1;
  min-width: 0;
`;

const GroupIcon = styled.div`
  font-size: 2.25rem;
  line-height: 2.5rem;
  flex-shrink: 0;
`;

const GroupInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.xs || '0.25rem'};
`;

const GroupTitle = styled.h3`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.xl || '1.5rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#000'};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
`;

const GroupTypeLabel = styled.p`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666'};
  margin: 0;
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
  flex-shrink: 0;
`;

// Helper functions
const getGroupTypeIcon = (type: GroupType) => {
  switch (type) {
    case 'couple':
      return <HiHeart />;
    case 'friends':
      return <HiUsers />;
    case 'watch_party':
      return <HiFilm />;
    default:
      return <HiUsers />;
  }
};

const getGroupTypeName = (type: GroupType): string => {
  switch (type) {
    case 'couple':
      return 'Couple';
    case 'friends':
      return 'Friends';
    case 'watch_party':
      return 'Watch Party';
    default:
      return 'Group';
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'warning';
    case 'archived':
      return 'secondary';
    default:
      return 'default';
  }
};

export default function GroupHeader({ group }: GroupHeaderProps) {
  return (
    <HeaderSection>
      <HeaderLeft>
        <GroupIcon>{getGroupTypeIcon(group.type)}</GroupIcon>
        <GroupInfo>
          <GroupTitle>{group.name}</GroupTitle>
          <GroupTypeLabel>{getGroupTypeName(group.type)}</GroupTypeLabel>
        </GroupInfo>
      </HeaderLeft>
      <BadgeContainer>
        <Badge variant={getStatusBadgeVariant(group.status)} size="small" pill>
          {group.status}
        </Badge>
        {group.settings.isPublic && (
          <Badge variant="info" size="small" outlined pill>
            Public
          </Badge>
        )}
      </BadgeContainer>
    </HeaderSection>
  );
}
