import { BASE_URL, fetchWithAuth, type Paginated } from './utils';

export type UserRole = 'user' | 'admin';
export type UserStatus =
  'active' | 'inactive' | 'pending' | 'suspended' | 'banned';

export interface AdminUserSummary {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  lastLogin: string | null;
  createdAt: string;
}

export interface AdminSessionSummary {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  createdAt: string;
  expiresAt: string;
}

export type AuditLogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface AuditLogEntry {
  id: string;
  level: AuditLogLevel;
  message: string;
  context: Record<string, unknown> | null;
  source: string;
  createdAt: string;
}

export interface AuditLogStats {
  total: number;
  byLevel: Record<AuditLogLevel, number>;
  oldestAt: string | null;
  newestAt: string | null;
}

export type ContentType = 'movie' | 'show' | 'episode';
export type ContentStatus = 'active' | 'pending' | 'flagged' | 'removed';

export interface AdminContentSummary {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  reportedCount: number;
  removalReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentReport {
  id: string;
  reason: string;
  details: string | null;
  status: 'pending' | 'dismissed' | 'resolved';
  createdAt: string;
  updatedAt: string;
  reporterUsername: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalHouseholds: number;
  premiumHouseholds: number;
  recentErrorCount: number;
}

// A nested tree, e.g. { general: { siteName: '...' }, recommendation: { llm_rerank: true } } --
// the backend has no fixed settings shape, see services/api/src/lib/adminSettings.ts.
export type SettingsTree = Record<string, unknown>;

const buildQuery = (
  params: Record<string, string | number | undefined>
): string => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.append(key, String(value));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

export const admin = {
  dashboard: {
    getStats: (): Promise<DashboardStats> =>
      fetchWithAuth('/api/admin/dashboard-stats'),
  },

  users: {
    list: (
      params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: UserRole;
        status?: UserStatus;
        sortBy?: 'createdAt' | 'username' | 'email' | 'lastLogin';
        sortOrder?: 'asc' | 'desc';
      } = {}
    ): Promise<Paginated<AdminUserSummary>> =>
      fetchWithAuth(`/api/admin/users${buildQuery(params)}`),

    get: (userId: string): Promise<AdminUserSummary> =>
      fetchWithAuth(`/api/admin/users/${userId}`),

    create: (data: {
      username: string;
      email: string;
      password: string;
      role?: UserRole;
      status?: UserStatus;
    }): Promise<AdminUserSummary> =>
      fetchWithAuth('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (
      userId: string,
      updates: {
        username?: string;
        email?: string;
        role?: UserRole;
        status?: UserStatus;
      }
    ): Promise<AdminUserSummary> =>
      fetchWithAuth(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    remove: (userId: string): Promise<void> =>
      fetchWithAuth(`/api/admin/users/${userId}`, { method: 'DELETE' }),

    changeStatus: (
      userId: string,
      status: UserStatus,
      reason?: string
    ): Promise<AdminUserSummary> =>
      fetchWithAuth(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      }),

    // sendEmail defaults true server-side; pass false to get the password back instead of emailing it.
    resetPassword: (
      userId: string,
      sendEmail = true
    ): Promise<{ newPassword?: string; ok?: boolean }> =>
      fetchWithAuth(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ sendEmail }),
      }),

    forcePasswordReset: (userId: string): Promise<{ ok: boolean }> =>
      fetchWithAuth(`/api/admin/users/${userId}/force-password-reset`, {
        method: 'POST',
      }),

    resendVerification: (userId: string): Promise<{ ok: boolean }> =>
      fetchWithAuth(`/api/admin/users/${userId}/resend-verification`, {
        method: 'POST',
      }),

    unlock: (userId: string): Promise<AdminUserSummary> =>
      fetchWithAuth(`/api/admin/users/${userId}/unlock`, { method: 'POST' }),

    lockedAccounts: (
      params: { page?: number; limit?: number } = {}
    ): Promise<Paginated<AdminUserSummary>> =>
      fetchWithAuth(`/api/admin/locked-accounts${buildQuery(params)}`),

    exportCsv: async (
      params: { role?: UserRole; status?: UserStatus } = {}
    ): Promise<string> => {
      const response = await fetch(
        `${BASE_URL}/api/admin/users/export${buildQuery(params)}`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error(`Failed to export users: ${response.status}`);
      }
      return response.text();
    },

    sessions: {
      list: (userId: string): Promise<AdminSessionSummary[]> =>
        fetchWithAuth(`/api/admin/users/${userId}/sessions`).then(
          (r: { sessions: AdminSessionSummary[] }) => r.sessions
        ),

      revoke: (userId: string, sessionId: string): Promise<void> =>
        fetchWithAuth(`/api/admin/users/${userId}/sessions/${sessionId}`, {
          method: 'DELETE',
        }),

      revokeAll: (userId: string): Promise<{ terminated: number }> =>
        fetchWithAuth(`/api/admin/users/${userId}/sessions`, {
          method: 'DELETE',
        }),
    },
  },

  auditLogs: {
    list: (
      params: { page?: number; limit?: number } = {}
    ): Promise<Paginated<AuditLogEntry>> =>
      fetchWithAuth(`/api/admin/audit-logs${buildQuery(params)}`),

    byLevel: (
      level: AuditLogLevel,
      params: { page?: number; limit?: number } = {}
    ): Promise<Paginated<AuditLogEntry>> =>
      fetchWithAuth(`/api/admin/audit-logs/${level}${buildQuery(params)}`),

    sources: (): Promise<string[]> =>
      fetchWithAuth('/api/admin/audit-logs/sources').then(
        (r: { sources: string[] }) => r.sources
      ),

    stats: (): Promise<AuditLogStats> =>
      fetchWithAuth('/api/admin/audit-logs/stats'),

    rotate: (
      retentionDays?: Partial<Record<AuditLogLevel, number>>
    ): Promise<Record<AuditLogLevel, number>> =>
      fetchWithAuth('/api/admin/audit-logs/rotation', {
        method: 'POST',
        body: JSON.stringify({ retentionDays }),
      }).then((r: { deleted: Record<AuditLogLevel, number> }) => r.deleted),
  },

  settings: {
    get: (): Promise<SettingsTree> => fetchWithAuth('/api/admin/settings'),

    update: (patch: SettingsTree): Promise<SettingsTree> =>
      fetchWithAuth('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
  },

  content: {
    list: (
      params: {
        page?: number;
        limit?: number;
        search?: string;
        type?: ContentType;
        status?: ContentStatus;
        sortBy?: 'reportedCount' | 'createdAt' | 'title';
        sortOrder?: 'asc' | 'desc';
      } = {}
    ): Promise<Paginated<AdminContentSummary>> =>
      fetchWithAuth(`/api/admin/content${buildQuery(params)}`),

    reports: (contentId: string): Promise<ContentReport[]> =>
      fetchWithAuth(`/api/admin/content/${contentId}/reports`).then(
        (r: { reports: ContentReport[] }) => r.reports
      ),

    update: (
      contentId: string,
      updates: { title?: string; status?: ContentStatus }
    ): Promise<AdminContentSummary> =>
      fetchWithAuth(`/api/admin/content/${contentId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    flag: (contentId: string): Promise<AdminContentSummary> =>
      fetchWithAuth(`/api/admin/content/${contentId}/flag`, {
        method: 'PATCH',
      }),

    approve: (contentId: string): Promise<AdminContentSummary> =>
      fetchWithAuth(`/api/admin/content/${contentId}/approve`, {
        method: 'PATCH',
      }),

    remove: (
      contentId: string,
      reason?: string
    ): Promise<AdminContentSummary> =>
      fetchWithAuth(`/api/admin/content/${contentId}/remove`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      }),

    dismissReport: (
      reportId: string
    ): Promise<{ id: string; status: 'dismissed' }> =>
      fetchWithAuth(`/api/admin/reports/${reportId}/dismiss`, {
        method: 'PATCH',
      }),
  },
};
