import { useCallback, useEffect, useState } from 'react';
import { groupsApi } from '../../../services/api';
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
  fetchPrimaryRelationship: () => Promise<void>;
  createGroup: (data: CreateGroupRequest) => Promise<Group>;
  createRelationship: (data: CreateRelationshipRequest) => Promise<Group>;
  expandRelationship: (groupId: string, emails: string[]) => Promise<Group>;
  deleteGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export default function useGroups(): UseGroupsReturn {
  const [groups, setGroups] = useState<Group[]>([]);
  const [primaryRelationship, setPrimaryRelationship] = useState<Group | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await groupsApi.getUserGroups();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPrimaryRelationship = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await groupsApi.getPrimaryRelationship();
      setPrimaryRelationship(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch primary relationship'
      );
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
    async (data: CreateRelationshipRequest): Promise<Group> => {
      try {
        setLoading(true);
        setError(null);
        const newRelationship = await groupsApi.createRelationship(data);
        setPrimaryRelationship(newRelationship);
        setGroups(prev => [newRelationship, ...prev]);
        return newRelationship;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create relationship';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
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

  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([fetchGroups(), fetchPrimaryRelationship()]);
  }, [fetchGroups, fetchPrimaryRelationship]);

  // Load initial data
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    // State
    groups,
    primaryRelationship,
    loading,
    error,

    // Actions
    fetchGroups,
    fetchPrimaryRelationship,
    createGroup,
    createRelationship,
    expandRelationship,
    deleteGroup,
    leaveGroup,
    refresh,
  };
}
