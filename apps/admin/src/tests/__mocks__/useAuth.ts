// Mock useAuth hook for Jest tests
export const useAuth = () => ({
  user: null,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
});

export default useAuth;
