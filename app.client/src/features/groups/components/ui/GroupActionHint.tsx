import { HiEye } from 'react-icons/hi2';
import styled from 'styled-components';

interface GroupActionHintProps {
  show: boolean;
}

// Styled components
const ActionHint = styled.div`
  padding: ${({ theme }) => theme?.spacing?.md || '1rem'} 0;
  border-top: 1px solid
    ${({ theme }) => theme?.colors?.border?.light || '#f0f0f0'};
`;

const ActionHintContent = styled.div`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#999'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
`;

export default function GroupActionHint({ show }: GroupActionHintProps) {
  if (!show) {
    return null;
  }

  return (
    <ActionHint>
      <ActionHintContent>
        <HiEye />
        <span>Click to view details</span>
      </ActionHintContent>
    </ActionHint>
  );
}
