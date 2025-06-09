/**
 * Mock of the API service for testing
 * This mock replaces all the actual API functions with Jest mock functions
 */

export const BASE_URL = 'http://localhost:3000';

// Mock all API functions
export const fetchWithAuth = jest.fn();

export const auth = {
  login: jest.fn().mockResolvedValue({
    token: 'fake-token',
    user: { id: '1', email: 'test@example.com' },
  }),
  getCurrentUser: jest.fn().mockResolvedValue({
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
  }),
};

export const user = {
  updatePassword: jest.fn().mockResolvedValue({ message: 'Password updated' }),
  updateEmail: jest.fn().mockResolvedValue({
    message: 'Email updated',
    user: { user_id: '1', email: 'new@example.com', username: 'testuser' },
    token: 'new-token',
  }),
  updateUsername: jest.fn().mockResolvedValue({
    message: 'Username updated',
    user: { user_id: '1', email: 'test@example.com', username: 'newusername' },
    token: 'new-token',
  }),
  findByEmail: jest.fn().mockResolvedValue({
    id: '2',
    email: 'found@example.com',
    username: 'founduser',
  }),
  updatePreferences: jest
    .fn()
    .mockResolvedValue({ message: 'Preferences updated' }),
};

export const search = {
  media: jest.fn().mockResolvedValue([
    {
      id: 1,
      title: 'Test Movie',
      media_type: 'movie',
      poster_path: '/path.jpg',
      overview: 'Test overview',
    },
  ]),
};

export const watchlist = {
  getAll: jest.fn().mockResolvedValue([
    {
      entry_id: '1',
      user_id: '1',
      tmdb_id: 1,
      media_type: 'movie',
      status: 'to_watch',
    },
  ]),
  add: jest.fn().mockResolvedValue({
    entry_id: '2',
    user_id: '1',
    tmdb_id: 2,
    media_type: 'tv',
    status: 'watching',
  }),
  update: jest.fn().mockResolvedValue({
    entry_id: '1',
    user_id: '1',
    tmdb_id: 1,
    media_type: 'movie',
    status: 'finished',
  }),
  getMatches: jest.fn().mockResolvedValue([
    {
      tmdb_id: 1,
      media_type: 'movie',
      title: 'Matched Movie',
      user1_status: 'to_watch',
      user2_status: 'to_watch',
    },
  ]),
};

export const matches = {
  getAll: jest
    .fn()
    .mockResolvedValue([
      { match_id: '1', user1_id: '1', user2_id: '2', status: 'pending' },
    ]),
  create: jest.fn().mockResolvedValue({
    match_id: '2',
    user1_id: '1',
    user2_id: '3',
    status: 'pending',
  }),
  updateStatus: jest.fn().mockResolvedValue({
    match_id: '1',
    user1_id: '1',
    user2_id: '2',
    status: 'accepted',
  }),
};
