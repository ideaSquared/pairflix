import { Card, CardContent, CardHeader, CardTitle } from '@pairflix/components';
import { Link } from 'react-router-dom';
import type { Group, GroupType } from '../../../types/group';

interface GroupCardProps {
  group: Group;
  onClick?: (group: Group) => void;
  className?: string;
}

const getGroupTypeIcon = (type: GroupType): string => {
  switch (type) {
    case 'couple':
      return '💕';
    case 'friends':
      return '👥';
    case 'watch_party':
      return '🍿';
    default:
      return '👥';
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

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'inactive':
      return 'text-yellow-600 bg-yellow-100';
    case 'archived':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export default function GroupCard({
  group,
  onClick,
  className = '',
}: GroupCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(group);
    }
  };

  const cardContent = (
    <Card
      className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getGroupTypeIcon(group.type)}</span>
            <div>
              <CardTitle className="text-lg font-semibold">
                {group.name}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {getGroupTypeName(group.type)}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}
          >
            {group.status}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {group.description && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {group.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span>👤</span>
              <span>
                {group.member_count || group.members?.length || 0} members
              </span>
            </span>

            {group.settings.isPublic ? (
              <span className="flex items-center space-x-1">
                <span>🌐</span>
                <span>Public</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <span>🔒</span>
                <span>Private</span>
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500">
            Created {new Date(group.created_at).toLocaleDateString()}
          </div>
        </div>

        {group.creator && (
          <div className="mt-2 text-xs text-gray-600">
            Created by {group.creator.username}
          </div>
        )}

        {group.settings.scheduleSettings?.recurringDay && (
          <div className="mt-2 flex items-center space-x-1 text-xs text-blue-600">
            <span>📅</span>
            <span>
              {group.settings.scheduleSettings.recurringDay}s at{' '}
              {group.settings.scheduleSettings.recurringTime}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // If onClick is provided, render as clickable div
  // Otherwise, wrap with Link for navigation
  if (onClick) {
    return cardContent;
  }

  return (
    <Link to={`/groups/${group.group_id}`} className="block">
      {cardContent}
    </Link>
  );
}
