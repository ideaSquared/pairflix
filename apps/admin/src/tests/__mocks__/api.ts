/**
 * Mock of the API service for testing
 * This mock replaces all the actual API functions with vi.fn mocks
 */

import type { Mock } from 'vitest';

export const BASE_URL = 'http://localhost:8787';

// Mock all API functions. Explicit type annotations sidestep TS2742 -- without one, tsc's
// declaration-emission check (this workspace is a composite project) can't name vi.fn()'s
// inferred Mock type without reaching into vitest's internal pnpm store path.
export const fetchWithAuth: Mock = vi.fn();

const mockAdminUser = {
  id: '1',
  username: 'testadmin',
  email: 'admin@example.com',
  role: 'admin',
  status: 'active',
  emailVerified: true,
  totpEnabled: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const auth: Record<string, unknown> = {
  login: vi.fn().mockResolvedValue(mockAdminUser),
  getCurrentUser: vi.fn().mockResolvedValue(mockAdminUser),
  logout: vi.fn().mockResolvedValue(undefined),
};

export const twoFactor: Record<string, unknown> = {
  enroll: vi.fn().mockResolvedValue({
    secret: 'MOCKSECRET',
    otpauthUrl: 'otpauth://totp/Pairflix:admin@example.com?secret=MOCKSECRET',
  }),
  verify: vi.fn().mockResolvedValue({ backupCodes: ['code-1', 'code-2'] }),
  disable: vi.fn().mockResolvedValue(undefined),
};

const emptyPage = {
  data: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

const mockAdminUserSummary = {
  id: '1',
  username: 'testadmin',
  email: 'admin@example.com',
  role: 'admin',
  status: 'active',
  emailVerified: true,
  failedLoginAttempts: 0,
  lockedUntil: null,
  lastLogin: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockAdminContent = {
  id: '1',
  title: 'Test Movie',
  type: 'movie',
  status: 'active',
  reportedCount: 0,
  removalReason: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const admin: Record<string, unknown> = {
  dashboard: {
    getStats: vi.fn().mockResolvedValue({
      totalUsers: 0,
      activeUsers: 0,
      totalHouseholds: 0,
      premiumHouseholds: 0,
      recentErrorCount: 0,
    }),
  },
  users: {
    list: vi.fn().mockResolvedValue(emptyPage),
    get: vi.fn().mockResolvedValue(mockAdminUserSummary),
    create: vi.fn().mockResolvedValue(mockAdminUserSummary),
    update: vi.fn().mockResolvedValue(mockAdminUserSummary),
    remove: vi.fn().mockResolvedValue(undefined),
    changeStatus: vi.fn().mockResolvedValue(mockAdminUserSummary),
    resetPassword: vi.fn().mockResolvedValue({ ok: true }),
    forcePasswordReset: vi.fn().mockResolvedValue({ ok: true }),
    resendVerification: vi.fn().mockResolvedValue({ ok: true }),
    unlock: vi.fn().mockResolvedValue(mockAdminUserSummary),
    lockedAccounts: vi.fn().mockResolvedValue(emptyPage),
    exportCsv: vi.fn().mockResolvedValue(''),
    sessions: {
      list: vi.fn().mockResolvedValue([]),
      revoke: vi.fn().mockResolvedValue(undefined),
      revokeAll: vi.fn().mockResolvedValue({ terminated: 0 }),
    },
  },
  auditLogs: {
    list: vi.fn().mockResolvedValue(emptyPage),
    byLevel: vi.fn().mockResolvedValue(emptyPage),
    sources: vi.fn().mockResolvedValue([]),
    stats: vi.fn().mockResolvedValue({
      total: 0,
      byLevel: { info: 0, warn: 0, error: 0, debug: 0 },
      oldestAt: null,
      newestAt: null,
    }),
    rotate: vi.fn().mockResolvedValue({ info: 0, warn: 0, error: 0, debug: 0 }),
  },
  settings: {
    get: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
  },
  content: {
    list: vi.fn().mockResolvedValue(emptyPage),
    reports: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue(mockAdminContent),
    flag: vi.fn().mockResolvedValue(mockAdminContent),
    approve: vi.fn().mockResolvedValue(mockAdminContent),
    remove: vi.fn().mockResolvedValue(mockAdminContent),
    dismissReport: vi.fn().mockResolvedValue({ id: '1', status: 'dismissed' }),
  },
};
