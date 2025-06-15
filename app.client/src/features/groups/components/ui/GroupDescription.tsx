import styled from 'styled-components';
import type { Group } from '../../../../types/group';

interface GroupDescriptionProps {
  group: Group;
}

// Styled components
const DescriptionText = styled.p`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.base || '1rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#333'};
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export default function GroupDescription({ group }: GroupDescriptionProps) {
  if (!group.description) {
    return null;
  }

  return <DescriptionText>{group.description}</DescriptionText>;
}
