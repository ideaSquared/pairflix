import { useAuth } from '../../hooks/useAuth';

// Phase A delivers the real Household model + endpoint. Until then we derive a
// stable id from the authed user so the Tonight flow has something to call.
export interface ActiveHousehold {
  household_id: string;
  status: 'accepted';
}

export function useActiveHousehold(): {
  household: ActiveHousehold | null;
  isLoading: boolean;
} {
  const { user, isLoading } = useAuth();
  if (isLoading) return { household: null, isLoading: true };
  if (!user) return { household: null, isLoading: false };
  return {
    household: { household_id: user.user_id, status: 'accepted' },
    isLoading: false,
  };
}
