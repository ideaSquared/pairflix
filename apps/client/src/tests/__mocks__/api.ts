/**
 * Mock of the API service for testing
 * This mock replaces all the actual API functions with Jest mock functions
 */

export const BASE_URL = '';

// Mock all API functions
export const fetchWithAuth = jest.fn();

export const auth = {
  register: jest.fn().mockResolvedValue({
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
  }),
  login: jest.fn().mockResolvedValue({
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
  }),
  getCurrentUser: jest.fn().mockResolvedValue({
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    status: 'active',
    emailVerified: true,
    totpEnabled: false,
    preferences: {
      theme: 'dark',
      viewStyle: 'grid',
      emailNotifications: true,
      autoArchiveDays: 30,
      favoriteGenres: [],
    },
    createdAt: '2026-01-01T00:00:00.000Z',
  }),
  logout: jest.fn().mockResolvedValue(undefined),
};

export const user = {
  updatePassword: jest.fn().mockResolvedValue(undefined),
  updateEmail: jest.fn().mockResolvedValue({ pending: true }),
  updateUsername: jest
    .fn()
    .mockResolvedValue({ id: '1', username: 'newusername' }),
  updatePreferences: jest.fn().mockResolvedValue({
    preferences: {
      theme: 'dark',
      viewStyle: 'grid',
      emailNotifications: true,
      autoArchiveDays: 30,
      favoriteGenres: [],
    },
  }),
};

export const emailService = {
  forgotPassword: jest.fn().mockResolvedValue({ sent: true }),
  resetPassword: jest
    .fn()
    .mockResolvedValue({ id: '1', email: 'test@example.com' }),
  sendEmailVerification: jest.fn().mockResolvedValue({ sent: true }),
  resendVerification: jest.fn().mockResolvedValue({ sent: true }),
  verifyEmail: jest.fn().mockResolvedValue({ verified: true }),
};

export const billing = {
  getEntitlements: jest.fn().mockResolvedValue({
    tier: 'free',
    dailyPickLimit: 1,
    picksUsedToday: 0,
    picksRemaining: 1,
    canUseLlmRerank: false,
    canUseMultiRegion: false,
    regionLock: null,
  }),
  startCheckout: jest
    .fn()
    .mockResolvedValue({ checkoutUrl: 'https://example.com/checkout' }),
  cancel: jest.fn().mockResolvedValue(undefined),
  mockActivate: jest.fn().mockResolvedValue({ ok: true }),
};

export const history = {
  list: jest.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
  }),
  setEnjoyed: jest.fn().mockResolvedValue({
    entry: {
      id: '1',
      tmdbId: 1,
      mediaType: 'movie',
      watchedAt: '2026-01-01T00:00:00.000Z',
      enjoyed: true,
      moodAtPick: null,
      minutesBudgetAtPick: null,
      title: 'Test Movie',
      year: 2026,
      posterPath: null,
      providers: {},
    },
  }),
};

export const tasteOnboarding = {
  getDeck: jest.fn().mockResolvedValue({ cards: [] }),
  submit: jest.fn().mockResolvedValue(undefined),
};

export const households = {
  list: jest.fn().mockResolvedValue({ households: [] }),
  create: jest.fn().mockResolvedValue({
    household: {
      id: '1',
      name: null,
      role: 'owner',
      joinedAt: '2026-01-01T00:00:00.000Z',
      memberCount: 1,
    },
  }),
  invite: jest.fn().mockResolvedValue({
    invite: {
      id: '1',
      token: 'invite-token',
      invitedEmail: null,
      expiresAt: '2026-01-08T00:00:00.000Z',
      acceptedAt: null,
    },
  }),
  acceptInvite: jest.fn().mockResolvedValue({ householdId: '1' }),
  pick: jest.fn().mockResolvedValue({
    pick: {
      tmdbId: 1,
      mediaType: 'movie',
      title: 'Test Movie',
      year: 2026,
      runtime: 100,
      overview: 'Test overview',
      posterPath: null,
      providers: {},
    },
    alternates: [],
    rationale: 'Test rationale',
    score: 1,
  }),
  commit: jest.fn().mockResolvedValue({ id: '1' }),
  recordPickEvent: jest.fn().mockResolvedValue({ id: '1' }),
  launchProvider: jest.fn().mockResolvedValue({
    url: 'https://example.com/watch',
    providerName: 'Netflix',
    region: 'US',
  }),
};
