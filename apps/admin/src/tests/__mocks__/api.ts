/**
 * Mock of the API service for testing
 * This mock replaces all the actual API functions with Jest mock functions
 */

export const BASE_URL = 'http://localhost:8787';

// Mock all API functions
export const fetchWithAuth = jest.fn();

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

export const auth = {
  login: jest.fn().mockResolvedValue(mockAdminUser),
  getCurrentUser: jest.fn().mockResolvedValue(mockAdminUser),
  logout: jest.fn().mockResolvedValue(undefined),
};

export const twoFactor = {
  enroll: jest.fn().mockResolvedValue({
    secret: 'MOCKSECRET',
    otpauthUrl: 'otpauth://totp/Pairflix:admin@example.com?secret=MOCKSECRET',
  }),
  verify: jest.fn().mockResolvedValue({ backupCodes: ['code-1', 'code-2'] }),
  disable: jest.fn().mockResolvedValue(undefined),
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

export const admin = {
  dashboard: {
    getStats: jest.fn().mockResolvedValue({
      totalUsers: 0,
      activeUsers: 0,
      totalHouseholds: 0,
      premiumHouseholds: 0,
      recentErrorCount: 0,
    }),
  },
  users: {
    list: jest.fn().mockResolvedValue(emptyPage),
    get: jest.fn().mockResolvedValue(mockAdminUserSummary),
    create: jest.fn().mockResolvedValue(mockAdminUserSummary),
    update: jest.fn().mockResolvedValue(mockAdminUserSummary),
    remove: jest.fn().mockResolvedValue(undefined),
    changeStatus: jest.fn().mockResolvedValue(mockAdminUserSummary),
    resetPassword: jest.fn().mockResolvedValue({ ok: true }),
    forcePasswordReset: jest.fn().mockResolvedValue({ ok: true }),
    resendVerification: jest.fn().mockResolvedValue({ ok: true }),
    unlock: jest.fn().mockResolvedValue(mockAdminUserSummary),
    lockedAccounts: jest.fn().mockResolvedValue(emptyPage),
    exportCsv: jest.fn().mockResolvedValue(''),
    sessions: {
      list: jest.fn().mockResolvedValue([]),
      revoke: jest.fn().mockResolvedValue(undefined),
      revokeAll: jest.fn().mockResolvedValue({ terminated: 0 }),
    },
  },
  auditLogs: {
    list: jest.fn().mockResolvedValue(emptyPage),
    byLevel: jest.fn().mockResolvedValue(emptyPage),
    sources: jest.fn().mockResolvedValue([]),
    stats: jest.fn().mockResolvedValue({
      total: 0,
      byLevel: { info: 0, warn: 0, error: 0, debug: 0 },
      oldestAt: null,
      newestAt: null,
    }),
    rotate: jest
      .fn()
      .mockResolvedValue({ info: 0, warn: 0, error: 0, debug: 0 }),
  },
  settings: {
    get: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
  },
  content: {
    list: jest.fn().mockResolvedValue(emptyPage),
    reports: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue(mockAdminContent),
    flag: jest.fn().mockResolvedValue(mockAdminContent),
    approve: jest.fn().mockResolvedValue(mockAdminContent),
    remove: jest.fn().mockResolvedValue(mockAdminContent),
    dismissReport: jest
      .fn()
      .mockResolvedValue({ id: '1', status: 'dismissed' }),
  },
};
