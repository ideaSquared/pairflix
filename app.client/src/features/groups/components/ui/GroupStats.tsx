import { HiUser } from 'react-icons/hi2';
import styled from 'styled-components';
import type { Group } from '../../../../types/group';

interface GroupStatsProps {
  group: Group;
}

// Styled components
const StatsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  padding: ${({ theme }) => theme?.spacing?.md || '1rem'} 0;
  border-top: 1px solid
    ${({ theme }) => theme?.colors?.border?.light || '#f0f0f0'};
  border-bottom: 1px solid
    ${({ theme }) => theme?.colors?.border?.light || '#f0f0f0'};
`;

const StatsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.xl || '2rem'};
`;

const MemberCount = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666'};
`;

const MemberIcon = styled.span`
  font-size: 1.125rem;
`;

const MemberText = styled.span`
  font-weight: ${({ theme }) =>
    theme?.typography?.fontWeight?.semibold || '600'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#000'};
`;

const MaxMembers = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.xs || '0.25rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#999'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
`;

const DateText = styled.div`
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#999'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
`;

export default function GroupStats({ group }: GroupStatsProps) {
  const memberCount = group.member_count || group.members?.length || 0;

  return (
    <StatsRow>
      <StatsLeft>
        <MemberCount>
          <MemberIcon>
            <HiUser />
          </MemberIcon>
          <MemberText>{memberCount}</MemberText>
          <span>{memberCount === 1 ? 'member' : 'members'}</span>
        </MemberCount>

        {group.max_members && (
          <MaxMembers>
            <span>/</span>
            <span>{group.max_members} max</span>
          </MaxMembers>
        )}
      </StatsLeft>

      <DateText>
        {new Date(group.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </DateText>
    </StatsRow>
  );
}
