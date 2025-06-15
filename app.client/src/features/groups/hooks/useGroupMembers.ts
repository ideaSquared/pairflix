import { useCallback, useEffect, useState } from 'react';
import { groupsApi } from '../../../services/api/groups';
import type { GroupMember, MemberRole } from '../../../types/group';

interface UseGroupMembersReturn {
  // State
  members: GroupMember[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchMembers: (groupId: string) => Promise<void>;
  updateMemberRole: (
    groupId: string,
    memberId: string,
    role: MemberRole
  ) => Promise<void>;
  removeMember: (groupId: string, memberId: string) => Promise<void>;
  refresh: (groupId: string) => Promise<void>;

  // Utilities
  getMembersByRole: (role: MemberRole) => GroupMember[];
  getPendingMembers: () => GroupMember[];
  getActiveMembers: () => GroupMember[];
  isOwner: (memberId: string) => boolean;
  isAdmin: (memberId: string) => boolean;
  canManageMembers: (currentUserRole: MemberRole) => boolean;
}

export function useGroupMembers(groupId: string): UseGroupMembersReturn {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await groupsApi.getGroupMembers(groupId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const updateMemberRole = useCallback(
    async (
      groupId: string,
      memberId: string,
      role: MemberRole
    ): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const updatedMember = await groupsApi.updateMemberRole(
          groupId,
          memberId,
          role
        );

        // Update the member in the list
        setMembers(prev =>
          prev.map(member =>
            member.membership_id === memberId ? updatedMember : member
          )
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update member role';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeMember = useCallback(
    async (groupId: string, memberId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        await groupsApi.removeMemberFromGroup(groupId, memberId);

        // Remove the member from the list
        setMembers(prev =>
          prev.filter(member => member.membership_id !== memberId)
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to remove member';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    await fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Utility functions
  const getMembersByRole = useCallback(
    (role: MemberRole): GroupMember[] => {
      return members.filter(member => member.role === role);
    },
    [members]
  );

  const getPendingMembers = useCallback((): GroupMember[] => {
    return members.filter(member => member.status === 'pending');
  }, [members]);

  const getActiveMembers = useCallback((): GroupMember[] => {
    return members.filter(member => member.status === 'active');
  }, [members]);

  const isOwner = useCallback(
    (memberId: string): boolean => {
      const member = members.find(m => m.membership_id === memberId);
      return member?.role === 'owner';
    },
    [members]
  );

  const isAdmin = useCallback(
    (memberId: string): boolean => {
      const member = members.find(m => m.membership_id === memberId);
      return member?.role === 'admin' || member?.role === 'owner';
    },
    [members]
  );

  const canManageMembers = useCallback(
    (currentUserRole: MemberRole): boolean => {
      return currentUserRole === 'owner' || currentUserRole === 'admin';
    },
    []
  );

  return {
    // State
    members,
    loading,
    error,

    // Actions
    fetchMembers,
    updateMemberRole,
    removeMember,
    refresh,

    // Utilities
    getMembersByRole,
    getPendingMembers,
    getActiveMembers,
    isOwner,
    isAdmin,
    canManageMembers,
  };
}
