import type { GroupType } from '../../../types/group';

export const getGroupTypeColor = (type: GroupType, theme: any): string => {
  switch (type) {
    case 'couple':
      return theme?.colors?.status?.watchTogetherBackground || '#ec4899';
    case 'friends':
      return theme?.colors?.primary || '#3b82f6';
    case 'watch_party':
      return theme?.colors?.text?.warning || '#f59e0b';
    default:
      return theme?.colors?.secondary || '#6b7280';
  }
};

export const formatMemberCount = (count: number): string => {
  return count === 1 ? '1 member' : `${count} members`;
};

export const formatGroupDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getGroupDisplayName = (type: GroupType): string => {
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

export const getBadgeVariantForStatus = (status: string) => {
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
