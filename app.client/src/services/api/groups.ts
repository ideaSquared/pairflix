import type {
  AddToGroupWatchlistRequest,
  CreateGroupRequest,
  CreateRelationshipRequest,
  Group,
  GroupContentMatch,
  GroupInvitation,
  GroupMember,
  GroupWatchlistEntry,
  InviteToGroupRequest,
} from '../../types/group';
import { fetchWithAuth } from './utils';

export const groupsApi = {
  // Relationship management (primary group for most users)
  async createRelationship(data: CreateRelationshipRequest): Promise<Group> {
    return fetchWithAuth('/api/groups/relationship', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getPrimaryRelationship(): Promise<Group | null> {
    return fetchWithAuth('/api/groups/relationship');
  },

  // Group management (for advanced users with multiple groups)
  async createGroup(data: CreateGroupRequest): Promise<Group> {
    return fetchWithAuth('/api/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getUserGroups(): Promise<Group[]> {
    return fetchWithAuth('/api/groups');
  },

  async getGroupInvitations(): Promise<GroupInvitation[]> {
    return fetchWithAuth('/api/groups/invitations');
  },

  // Group expansion and modification
  async expandRelationship(
    groupId: string,
    data: { emails: string[] }
  ): Promise<Group> {
    return fetchWithAuth(`/api/groups/${groupId}/expand`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Group membership
  async inviteToGroup(
    groupId: string,
    data: InviteToGroupRequest
  ): Promise<{ invitations: GroupInvitation[] }> {
    return fetchWithAuth(`/api/groups/${groupId}/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async acceptGroupInvitation(groupId: string): Promise<GroupMember> {
    return fetchWithAuth(`/api/groups/${groupId}/accept`, {
      method: 'POST',
    });
  },

  async declineGroupInvitation(groupId: string): Promise<{ message: string }> {
    return fetchWithAuth(`/api/groups/${groupId}/decline`, {
      method: 'POST',
    });
  },

  // Group content
  async getGroupContentMatches(groupId: string): Promise<GroupContentMatch[]> {
    return fetchWithAuth(`/api/groups/${groupId}/matches`);
  },

  async addToGroupWatchlist(
    groupId: string,
    data: AddToGroupWatchlistRequest
  ): Promise<GroupWatchlistEntry> {
    return fetchWithAuth(`/api/groups/${groupId}/watchlist`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Additional utility methods for UI
  async getGroupDetails(groupId: string): Promise<Group> {
    // This would need to be implemented in the backend if not available
    // For now, we'll get it from the user's groups list
    const groups = await this.getUserGroups();
    const group = groups.find(g => g.group_id === groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    return group;
  },

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    // This would need to be implemented in the backend
    // For now, we'll get it from the group details
    const group = await this.getGroupDetails(groupId);
    return group.members || [];
  },

  async getGroupWatchlist(groupId: string): Promise<GroupWatchlistEntry[]> {
    // This would need to be implemented in the backend
    // For now, we'll use the matches endpoint as a placeholder
    // Note: This is a temporary implementation - in reality, these would be separate endpoints
    const matches = await this.getGroupContentMatches(groupId);

    // Transform GroupContentMatch[] to GroupWatchlistEntry[] for compatibility
    // This is a placeholder transformation until proper backend endpoints are implemented
    return matches.map((match, index) => {
      const entry: GroupWatchlistEntry = {
        group_entry_id: `temp-${match.tmdb_id}-${index}`,
        group_id: groupId,
        tmdb_id: match.tmdb_id,
        media_type: match.media_type,
        status: 'suggested' as const,
        suggested_by: 'system',
        votes_for: 0,
        votes_against: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Only add content if we have a title
      if (match.title) {
        entry.content = {
          title: match.title,
          ...(match.poster_path && { poster_path: match.poster_path }),
          ...(match.overview && { overview: match.overview }),
          ...(match.release_date && { release_date: match.release_date }),
          ...(match.first_air_date && { first_air_date: match.first_air_date }),
        };
      }

      return entry;
    });
  },

  // Voting on group watchlist items (would need backend implementation)
  async voteOnWatchlistItem(
    groupId: string,
    entryId: string,
    vote: 'for' | 'against'
  ): Promise<GroupWatchlistEntry> {
    return fetchWithAuth(`/api/groups/${groupId}/watchlist/${entryId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    });
  },

  // Update group watchlist item status (would need backend implementation)
  async updateWatchlistItemStatus(
    groupId: string,
    entryId: string,
    status: string
  ): Promise<GroupWatchlistEntry> {
    return fetchWithAuth(`/api/groups/${groupId}/watchlist/${entryId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Remove member from group (would need backend implementation)
  async removeMemberFromGroup(
    groupId: string,
    memberId: string
  ): Promise<{ message: string }> {
    return fetchWithAuth(`/api/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    });
  },

  // Update member role (would need backend implementation)
  async updateMemberRole(
    groupId: string,
    memberId: string,
    role: string
  ): Promise<GroupMember> {
    return fetchWithAuth(`/api/groups/${groupId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  // Leave group (would need backend implementation)
  async leaveGroup(groupId: string): Promise<{ message: string }> {
    return fetchWithAuth(`/api/groups/${groupId}/leave`, {
      method: 'POST',
    });
  },

  // Update group settings (would need backend implementation)
  async updateGroupSettings(
    groupId: string,
    settings: Partial<Group>
  ): Promise<Group> {
    return fetchWithAuth(`/api/groups/${groupId}`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  // Delete group (would need backend implementation)
  async deleteGroup(groupId: string): Promise<{ message: string }> {
    return fetchWithAuth(`/api/groups/${groupId}`, {
      method: 'DELETE',
    });
  },
};

export default groupsApi;
