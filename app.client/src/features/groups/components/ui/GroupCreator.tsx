import styled from 'styled-components';
import type { Group } from '../../../../types/group';

interface GroupCreatorProps {
  group: Group;
}

// Styled components
const CreatorSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.md || '1rem'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666'};
  padding: ${({ theme }) => theme?.spacing?.md || '1rem'} 0;
  border-top: 1px solid
    ${({ theme }) => theme?.colors?.border?.light || '#f0f0f0'};
`;

const CreatorAvatar = styled.div`
  width: 2rem;
  height: 2rem;
  background-color: ${({ theme }) =>
    theme?.colors?.background?.secondary || '#d1d5db'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${({ theme }) =>
    theme?.typography?.fontWeight?.semibold || '600'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  flex-shrink: 0;
`;

export default function GroupCreator({ group }: GroupCreatorProps) {
  if (!group.creator) {
    return null;
  }

  return (
    <CreatorSection>
      <CreatorAvatar>{group.creator.username[0]?.toUpperCase()}</CreatorAvatar>
      <span>Created by {group.creator.username}</span>
    </CreatorSection>
  );
}
