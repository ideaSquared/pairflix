import { Badge } from '@pairflix/components';
import { HiCalendarDays } from 'react-icons/hi2';
import styled from 'styled-components';
import type { Group } from '../../../../types/group';

interface GroupScheduleProps {
  group: Group;
}

// Styled components
const ScheduleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  padding: ${({ theme }) => theme?.spacing?.sm || '0.5rem'} 0;
`;

export default function GroupSchedule({ group }: GroupScheduleProps) {
  if (!group.settings.scheduleSettings?.recurringDay) {
    return null;
  }

  return (
    <ScheduleContainer>
      <Badge variant="info" size="small" outlined>
        <HiCalendarDays style={{ marginRight: '0.25rem' }} />
        {group.settings.scheduleSettings.recurringDay}s at{' '}
        {group.settings.scheduleSettings.recurringTime}
      </Badge>
    </ScheduleContainer>
  );
}
