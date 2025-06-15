import { useCallback, useEffect, useState } from 'react';
import { groupsApi } from '../../../services/api/groups';
import type {
  GroupInvitation,
  InviteToGroupRequest,
} from '../../../types/group';

interface UseGroupInvitationsReturn {
  // State
  invitations: GroupInvitation[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchInvitations: () => Promise<void>;
  sendInvitations: (
    groupId: string,
    data: InviteToGroupRequest
  ) => Promise<void>;
  acceptInvitation: (groupId: string) => Promise<void>;
  declineInvitation: (groupId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useGroupInvitations(): UseGroupInvitationsReturn {
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await groupsApi.getGroupInvitations();
      setInvitations(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch invitations'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const sendInvitations = useCallback(
    async (groupId: string, data: InviteToGroupRequest): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        await groupsApi.inviteToGroup(groupId, data);
        // Note: This doesn't update local state as the invitations are sent to other users
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to send invitations';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const acceptInvitation = useCallback(async (groupId: string) => {
    try {
      setLoading(true);
      setError(null);
      await groupsApi.acceptGroupInvitation(groupId);
      // Remove from invitations list
      setInvitations(prev => prev.filter(inv => inv.group_id !== groupId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to accept invitation'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const declineInvitation = useCallback(async (groupId: string) => {
    try {
      setLoading(true);
      setError(null);
      await groupsApi.declineGroupInvitation(groupId);
      // Remove from invitations list
      setInvitations(prev => prev.filter(inv => inv.group_id !== groupId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to decline invitation'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchInvitations();
  }, [fetchInvitations]);

  // Load initial data
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  return {
    // State
    invitations,
    loading,
    error,

    // Actions
    fetchInvitations,
    sendInvitations,
    acceptInvitation,
    declineInvitation,
    refresh,
  };
}
