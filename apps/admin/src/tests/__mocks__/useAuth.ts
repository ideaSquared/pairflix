// Mock useAuth hook for tests. Explicit return type sidesteps TS2742 -- without one, tsc's
// declaration-emission check (this workspace is a composite project) can't name vi.fn()'s
// inferred Mock type without reaching into vitest's internal pnpm store path.
export const useAuth = (): Record<string, unknown> => ({
  user: null,
  isLoading: false,
  error: null,
  logout: vi.fn(),
  checkAuth: vi.fn(),
  isAuthenticated: false,
});

export default useAuth;
