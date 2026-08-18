// Mock useAuth hook for Jest tests
export const useAuth = () => ({
  user: null,
  isLoading: false,
  error: null,
  logout: jest.fn(),
  checkAuth: jest.fn(),
  isAuthenticated: false,
});

export default useAuth;
