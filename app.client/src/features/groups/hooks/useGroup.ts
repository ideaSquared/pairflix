import { useCallback, useEffect, useState } from 'react';
import { groupsApi } from '../../../services/api/groups';
import type { Group } from '../../../types/group';

interface UseGroupReturn {
  group: Group | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useGroup(groupId: string): UseGroupReturn {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroup = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await groupsApi.getGroupDetails(groupId);
      setGroup(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch group');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const refresh = useCallback(async () => {
    await fetchGroup();
  }, [fetchGroup]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  return {
    group,
    loading,
    error,
    refresh,
  };
}
