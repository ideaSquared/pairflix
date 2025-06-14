import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@pairflix/components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GroupFilters } from '../../../types/group';
import CreateRelationshipForm from '../components/CreateRelationshipForm';
import GroupCard from '../components/GroupCard';
import GroupInvitations from '../components/GroupInvitations';
import { useGroupInvitations, useGroups } from '../hooks';

export default function GroupsPage() {
  const navigate = useNavigate();
  const {
    groups,
    primaryRelationship,
    loading,
    error,
    createRelationship,
    refresh,
  } = useGroups();

  const {
    invitations,
    loading: invitationsLoading,
    acceptInvitation,
    declineInvitation,
  } = useGroupInvitations();

  const [filters, setFilters] = useState<GroupFilters>({});
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter groups based on current filters
  const filteredGroups = groups.filter(group => {
    if (filters.type && group.type !== filters.type) return false;
    if (filters.status && group.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        group.name.toLowerCase().includes(searchLower) ||
        group.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleCreateGroup = () => {
    navigate('/groups/create');
  };

  const handleCreateRelationship = async (data: any) => {
    try {
      await createRelationship(data);
      setShowCreateForm(false);
      refresh();
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleInvitationAction = async (
    groupId: string,
    action: 'accept' | 'decline'
  ) => {
    try {
      if (action === 'accept') {
        await acceptInvitation(groupId);
      } else {
        await declineInvitation(groupId);
      }
      refresh(); // Refresh groups after accepting an invitation
    } catch {
      // Error handling is done in the hook
    }
  };

  if (loading && !groups.length) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
            <p className="mt-2 text-gray-600">
              Manage your groups and find content to watch together
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex space-x-3">
            {!primaryRelationship && (
              <Button onClick={() => setShowCreateForm(true)} variant="outline">
                Create Relationship
              </Button>
            )}
            <Button onClick={handleCreateGroup}>Create Group</Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Invitations Section */}
        {invitations.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Pending Invitations ({invitations.length})
            </h2>
            <GroupInvitations
              invitations={invitations}
              onAccept={groupId => handleInvitationAction(groupId, 'accept')}
              onDecline={groupId => handleInvitationAction(groupId, 'decline')}
              loading={invitationsLoading}
            />
          </div>
        )}

        {/* Create Relationship Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">
              Create Your First Relationship
            </h2>
            <CreateRelationshipForm
              onSubmit={handleCreateRelationship}
              onCancel={() => setShowCreateForm(false)}
              loading={loading}
            />
          </div>
        )}

        {/* Primary Relationship Display */}
        {primaryRelationship && (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-purple-900 mb-4">
              Your Primary Relationship
            </h2>
            <GroupCard group={primaryRelationship} />
          </div>
        )}

        {/* Filters */}
        {groups.length > 0 && (
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Input
              placeholder="Search groups..."
              value={filters.search || ''}
              onChange={e =>
                setFilters(prev => ({ ...prev, search: e.target.value }))
              }
              className="sm:max-w-xs"
            />

            <Select
              value={filters.type || ''}
              onValueChange={value =>
                setFilters(prev => ({
                  ...prev,
                  type: (value as any) || undefined,
                }))
              }
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="couple">Couple</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="watch_party">Watch Party</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status || ''}
              onValueChange={value =>
                setFilters(prev => ({
                  ...prev,
                  status: (value as any) || undefined,
                }))
              }
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Groups Grid */}
        {filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(group => (
              <GroupCard key={group.group_id} group={group} />
            ))}
          </div>
        ) : groups.length > 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No groups match your filters
            </div>
            <Button
              variant="ghost"
              onClick={() => setFilters({})}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Groups Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first group or relationship to start finding content
              to watch together.
            </p>
            <div className="space-x-4">
              <Button onClick={() => setShowCreateForm(true)} variant="outline">
                Create Relationship
              </Button>
              <Button onClick={handleCreateGroup}>Create Group</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
