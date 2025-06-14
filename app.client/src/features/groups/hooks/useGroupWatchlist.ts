import { useCallback, useState } from 'react';
import { groupsApi } from '../../../services/api';
import type {
  AddToGroupWatchlistRequest,
  GroupWatchlistEntry,
  GroupWatchlistFilters,
} from '../../../types/group';

interface UseGroupWatchlistReturn {
  // State
  watchlist: GroupWatchlistEntry[];
  matches: any[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchWatchlist: (groupId: string) => Promise<void>;
  fetchMatches: (groupId: string) => Promise<void>;
  addToWatchlist: (
    groupId: string,
    data: AddToGroupWatchlistRequest
  ) => Promise<GroupWatchlistEntry>;
  voteOnItem: (
    groupId: string,
    entryId: string,
    vote: 'for' | 'against'
  ) => Promise<void>;
  updateItemStatus: (
    groupId: string,
    entryId: string,
    status: string
  ) => Promise<void>;
  refresh: (groupId: string) => Promise<void>;

  // Utilities
  getFilteredWatchlist: (
    filters: GroupWatchlistFilters
  ) => GroupWatchlistEntry[];
}

export default function useGroupWatchlist(): UseGroupWatchlistReturn {
  const [watchlist, setWatchlist] = useState<GroupWatchlistEntry[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async (groupId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await groupsApi.getGroupWatchlist(groupId);
      setWatchlist(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch group watchlist'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMatches = useCallback(async (groupId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await groupsApi.getGroupContentMatches(groupId);
      setMatches(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch group matches'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWatchlist = useCallback(
    async (
      groupId: string,
      data: AddToGroupWatchlistRequest
    ): Promise<GroupWatchlistEntry> => {
      try {
        setLoading(true);
        setError(null);
        const newEntry = await groupsApi.addToGroupWatchlist(groupId, data);
        setWatchlist(prev => [newEntry, ...prev]);
        return newEntry;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to add to group watchlist';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const voteOnItem = useCallback(
    async (
      groupId: string,
      entryId: string,
      vote: 'for' | 'against'
    ): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const updatedEntry = await groupsApi.voteOnWatchlistItem(
          groupId,
          entryId,
          vote
        );

        // Update the item in the watchlist
        setWatchlist(prev =>
          prev.map(item =>
            item.group_entry_id === entryId ? updatedEntry : item
          )
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to vote on item';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateItemStatus = useCallback(
    async (groupId: string, entryId: string, status: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const updatedEntry = await groupsApi.updateWatchlistItemStatus(
          groupId,
          entryId,
          status
        );

        // Update the item in the watchlist
        setWatchlist(prev =>
          prev.map(item =>
            item.group_entry_id === entryId ? updatedEntry : item
          )
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update item status';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refresh = useCallback(
    async (groupId: string): Promise<void> => {
      await Promise.all([fetchWatchlist(groupId), fetchMatches(groupId)]);
    },
    [fetchWatchlist, fetchMatches]
  );

  const getFilteredWatchlist = useCallback(
    (filters: GroupWatchlistFilters): GroupWatchlistEntry[] => {
      return watchlist.filter(item => {
        if (filters.status && item.status !== filters.status) {
          return false;
        }
        if (filters.media_type && item.media_type !== filters.media_type) {
          return false;
        }
        if (filters.search && item.content?.title) {
          const searchLower = filters.search.toLowerCase();
          const titleLower = item.content.title.toLowerCase();
          if (!titleLower.includes(searchLower)) {
            return false;
          }
        }
        return true;
      });
    },
    [watchlist]
  );

  return {
    // State
    watchlist,
    matches,
    loading,
    error,

    // Actions
    fetchWatchlist,
    fetchMatches,
    addToWatchlist,
    voteOnItem,
    updateItemStatus,
    refresh,

    // Utilities
    getFilteredWatchlist,
  };
}
