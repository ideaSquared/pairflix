import { HiFilm, HiUsers } from 'react-icons/hi2';
import styled, { useTheme } from 'styled-components';
import type { GroupType } from '../../../../types/group';

interface GroupTypeSelectorProps {
  selectedType: GroupType;
  onTypeSelect: (type: GroupType) => void;
  disabled?: boolean;
}

// Styled components
const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.md || '768px'}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const TypeOption = styled.div<{ $isSelected: boolean; $color: string }>`
  position: relative;
  cursor: pointer;
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
  border: 2px solid;
  border-color: ${({ $isSelected, $color, theme }) =>
    $isSelected ? $color : theme?.colors?.border?.default || '#d1d5db'};
  background-color: ${({ $isSelected, theme }) =>
    $isSelected
      ? theme?.colors?.background?.highlight || '#eff6ff'
      : theme?.colors?.background?.primary || '#ffffff'};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme?.colors?.border?.light || '#9ca3af'};
  }
`;

const TypeOptionContent = styled.div`
  padding: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const TypeOptionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.md || '1rem'};
  margin-bottom: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
`;

const TypeOptionIcon = styled.span<{ $color: string }>`
  font-size: 1.5rem;
  color: ${({ $color }) => $color};
`;

const TypeOptionLabel = styled.span`
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
`;

const TypeOptionDescription = styled.p`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin: 0;
`;

const HiddenRadio = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export default function GroupTypeSelector({
  selectedType,
  onTypeSelect,
  disabled = false,
}: GroupTypeSelectorProps) {
  const theme = useTheme();

  const groupTypeOptions = [
    {
      value: 'friends' as GroupType,
      label: 'Friends Group',
      description: 'Watch movies and shows with your friends',
      icon: <HiUsers />,
      color: theme?.colors?.primary || '#2563eb',
    },
    {
      value: 'watch_party' as GroupType,
      label: 'Watch Party',
      description: 'Organize watch parties and events',
      icon: <HiFilm />,
      color: theme?.colors?.text?.warning || '#ea580c',
    },
  ];

  return (
    <TypeGrid>
      {groupTypeOptions.map(option => (
        <TypeOption
          key={option.value}
          $isSelected={selectedType === option.value}
          $color={option.color}
          onClick={() => !disabled && onTypeSelect(option.value)}
        >
          <HiddenRadio
            type="radio"
            name="groupType"
            value={option.value}
            checked={selectedType === option.value}
            onChange={() => onTypeSelect(option.value)}
            disabled={disabled}
          />
          <TypeOptionContent>
            <TypeOptionHeader>
              <TypeOptionIcon $color={option.color}>
                {option.icon}
              </TypeOptionIcon>
              <TypeOptionLabel>{option.label}</TypeOptionLabel>
            </TypeOptionHeader>
            <TypeOptionDescription>{option.description}</TypeOptionDescription>
          </TypeOptionContent>
        </TypeOption>
      ))}
    </TypeGrid>
  );
}
