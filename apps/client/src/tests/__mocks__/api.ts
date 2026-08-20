/**
 * Mock of the API service for testing. Every import of `services/api` from a test file is
 * redirected here by the `test.alias` entry in vite.config.ts -- individual test files can layer
 * their own vi.mock('.../services/api', ...) on top to override specific functions.
 */

import type { Mock } from 'vitest';

export const BASE_URL = '';

// Mock all API functions. Explicit type annotations sidestep TS2742 -- without one, tsc's
// declaration-emission check (this workspace is a composite project) can't name vi.fn()'s
// inferred Mock type without reaching into vitest's internal pnpm store path.
export const fetchWithAuth: Mock = vi.fn();

export const auth: Record<string, unknown> = {
  register: vi.fn().mockResolvedValue({
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
  }),
  login: vi.fn().mockResolvedValue({
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
  }),
  getCurrentUser: vi.fn().mockResolvedValue({
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
  logout: vi.fn().mockResolvedValue(undefined),
};

export const user: Record<string, unknown> = {
  updatePassword: vi.fn().mockResolvedValue(undefined),
  updateEmail: vi.fn().mockResolvedValue({ pending: true }),
  updateUsername: vi
    .fn()
    .mockResolvedValue({ id: '1', username: 'newusername' }),
  updatePreferences: vi.fn().mockResolvedValue({
    preferences: {
      theme: 'dark',
      viewStyle: 'grid',
      emailNotifications: true,
      autoArchiveDays: 30,
      favoriteGenres: [],
    },
  }),
};

export const emailService: Record<string, unknown> = {
  forgotPassword: vi.fn().mockResolvedValue({ sent: true }),
  resetPassword: vi
    .fn()
    .mockResolvedValue({ id: '1', email: 'test@example.com' }),
  sendEmailVerification: vi.fn().mockResolvedValue({ sent: true }),
  resendVerification: vi.fn().mockResolvedValue({ sent: true }),
  verifyEmail: vi.fn().mockResolvedValue({ verified: true }),
};

export const billing: Record<string, unknown> = {
  getEntitlements: vi.fn().mockResolvedValue({
    tier: 'free',
    dailyPickLimit: 1,
    picksUsedToday: 0,
    picksRemaining: 1,
    canUseLlmRerank: false,
    canUseMultiRegion: false,
    regionLock: null,
  }),
  startCheckout: vi
    .fn()
    .mockResolvedValue({ checkoutUrl: 'https://example.com/checkout' }),
  cancel: vi.fn().mockResolvedValue(undefined),
  mockActivate: vi.fn().mockResolvedValue({ ok: true }),
};

export const history: Record<string, unknown> = {
  list: vi.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
  }),
  setEnjoyed: vi.fn().mockResolvedValue({
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

export const tasteOnboarding: Record<string, unknown> = {
  getDeck: vi.fn().mockResolvedValue({ cards: [] }),
  submit: vi.fn().mockResolvedValue(undefined),
};

export const households: Record<string, unknown> = {
  list: vi.fn().mockResolvedValue({ households: [] }),
  create: vi.fn().mockResolvedValue({
    household: {
      id: '1',
      name: null,
      role: 'owner',
      joinedAt: '2026-01-01T00:00:00.000Z',
      memberCount: 1,
    },
  }),
  invite: vi.fn().mockResolvedValue({
    invite: {
      id: '1',
      token: 'invite-token',
      invitedEmail: null,
      expiresAt: '2026-01-08T00:00:00.000Z',
      acceptedAt: null,
    },
  }),
  acceptInvite: vi.fn().mockResolvedValue({ householdId: '1' }),
  pick: vi.fn().mockResolvedValue({
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
  commit: vi.fn().mockResolvedValue({ id: '1' }),
  recordPickEvent: vi.fn().mockResolvedValue({ id: '1' }),
  launchProvider: vi.fn().mockResolvedValue({
    url: 'https://example.com/watch',
    providerName: 'Netflix',
    region: 'US',
  }),
};
