import { Button, Card, CardContent, CardHeader } from '@pairflix/components';
import type { GroupInvitation } from '../../../types/group';

interface GroupInvitationsProps {
  invitations: GroupInvitation[];
  onAccept: (groupId: string) => void;
  onDecline: (groupId: string) => void;
  loading?: boolean;
}

export default function GroupInvitations({
  invitations,
  onAccept,
  onDecline,
  loading = false,
}: GroupInvitationsProps) {
  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📮</div>
        <p className="text-gray-600">No pending invitations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map(invitation => (
        <Card key={invitation.group_id} className="border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold text-blue-900">
                  {invitation.group_name}
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Invited by {invitation.inviter_username}
                </p>
              </div>
              <div className="text-xs text-blue-600">
                {new Date(invitation.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <span>✉️</span>
                <span>Join this group to start watching together</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => onDecline(invitation.group_id)}
                  disabled={loading}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Decline
                </Button>
                <Button
                  size="small"
                  onClick={() => onAccept(invitation.group_id)}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Accept
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
