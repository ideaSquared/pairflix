import { useCallback, useEffect, useState } from 'react';
import { groupsApi } from '../../../services/api/groups';
import type {
  CreateGroupRequest,
  CreateRelationshipRequest,
  Group,
} from '../../../types/group';

interface UseGroupsReturn {
  // State
  groups: Group[];
  primaryRelationship: Group | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchGroups: () => Promise<void>;
  createGroup: (data: CreateGroupRequest) => Promise<Group>;
  createRelationship: (data: CreateRelationshipRequest) => Promise<void>;
  expandRelationship: (groupId: string, emails: string[]) => Promise<Group>;
  deleteGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useGroups(): UseGroupsReturn {
  const [groups, setGroups] = useState<Group[]>([]);
  const [primaryRelationship, setPrimaryRelationship] = useState<Group | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [groupsResponse, primaryResponse] = await Promise.all([
        groupsApi.getUserGroups(),
        groupsApi.getPrimaryRelationship().catch(() => null), // Don't fail if no primary relationship
      ]);

      setGroups(groupsResponse || []);
      setPrimaryRelationship(primaryResponse || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGroup = useCallback(
    async (data: CreateGroupRequest): Promise<Group> => {
      try {
        setLoading(true);
        setError(null);
        const newGroup = await groupsApi.createGroup(data);
        setGroups(prev => [newGroup, ...prev]);
        return newGroup;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create group';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createRelationship = useCallback(
    async (data: CreateRelationshipRequest) => {
      try {
        setLoading(true);
        setError(null);

        await groupsApi.createRelationship(data);
        await fetchGroups(); // Refresh after creating
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create relationship'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchGroups]
  );

  const expandRelationship = useCallback(
    async (groupId: string, emails: string[]): Promise<Group> => {
      try {
        setLoading(true);
        setError(null);
        const updatedGroup = await groupsApi.expandRelationship(groupId, {
          emails,
        });

        // Update the group in both primary relationship and groups list
        if (primaryRelationship?.group_id === groupId) {
          setPrimaryRelationship(updatedGroup);
        }
        setGroups(prev =>
          prev.map(group => (group.group_id === groupId ? updatedGroup : group))
        );

        return updatedGroup;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to expand relationship';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [primaryRelationship]
  );

  const deleteGroup = useCallback(
    async (groupId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        await groupsApi.deleteGroup(groupId);

        // Remove from state
        if (primaryRelationship?.group_id === groupId) {
          setPrimaryRelationship(null);
        }
        setGroups(prev => prev.filter(group => group.group_id !== groupId));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to delete group';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [primaryRelationship]
  );

  const leaveGroup = useCallback(
    async (groupId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        await groupsApi.leaveGroup(groupId);

        // Remove from state
        if (primaryRelationship?.group_id === groupId) {
          setPrimaryRelationship(null);
        }
        setGroups(prev => prev.filter(group => group.group_id !== groupId));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to leave group';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [primaryRelationship]
  );

  const refresh = useCallback(async () => {
    await fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    // State
    groups,
    primaryRelationship,
    loading,
    error,

    // Actions
    fetchGroups,
    createGroup,
    createRelationship,
    expandRelationship,
    deleteGroup,
    leaveGroup,
    refresh,
  };
}
