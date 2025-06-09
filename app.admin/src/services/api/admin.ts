/// <reference types="vite/client" />
import type { AdminUser } from './auth';
import { BASE_URL, fetchWithAuth, PaginatedResponse } from './utils';

// Re-export AdminUser from auth for convenience
export type { AdminUser } from './auth';

// Core interfaces
export interface AuditLog {
  log_id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  context: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogStats {
  total: number;
  byLevel: {
    info?: number;
    warn?: number;
    error?: number;
    debug?: number;
  };
  oldestLog: string | null;
  newestLog: string | null;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMatches: number;
  watchlistEntries: number;
}

export interface SystemStats {
  timestamp: Date;
  database: {
    totalUsers: number;
    newUsers: {
      lastDay: number;
      lastWeek: number;
      lastMonth: number;
    };
    activeUsers: number;
    inactivePercentage: number;
    contentStats: {
      watchlistEntries: number;
      matches: number;
      averageWatchlistPerUser: number;
    };
    errorCount: number;
    size: {
      bytes: number;
      megabytes: number;
    };
  };
  system: {
    os: {
      type: string;
      platform: string;
      arch: string;
      release: string;
      uptime: number;
      loadAvg: number[];
    };
    memory: {
      total: number;
      free: number;
      usagePercent: number;
    };
    cpu: {
      cores: number;
      model: string;
      speed: number;
    };
    process: {
      uptime: number;
      memoryUsage: Record<string, number>;
      nodeVersion: string;
      pid: number;
    };
  };
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connectionsPerSecond: number;
  };
  timestamp: string;
}

export interface AppSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    defaultUserRole: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    twoFactorAuth: {
      enabled: boolean;
      requiredForAdmins: boolean;
    };
  };
  email: {
    smtpServer: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    senderEmail: string;
    senderName: string;
    emailTemplatesPath: string;
  };
  media: {
    maxUploadSize: number;
    allowedFileTypes: string[];
    imageQuality: number;
    storageProvider: string;
  };
  features: {
    enableMatching: boolean;
    enableUserProfiles: boolean;
    enableNotifications: boolean;
    enableActivityFeed: boolean;
  };
}

export interface ActivityStats {
  totalActivities: number;
  last24Hours: number;
  lastWeek: number;
  activityByType: {
    action: string;
    count: number;
  }[];
  activityByDate: {
    date: string;
    count: number;
  }[];
  mostActiveUsers: {
    user_id: string;
    user?: {
      username: string;
      email: string;
    };
    count: number;
  }[];
}

export interface ActivityAnalytics {
  timeRange: {
    days: number;
    startDate: Date;
    endDate: Date;
  };
  popularActivities: {
    action: string;
    count: number;
  }[];
  timeline: {
    date: string;
    count: number;
  }[];
  contextStats: {
    label: string;
    count: number;
  }[];
  actionStats: {
    label: string;
    count: number;
  }[];
  userPatterns: {
    user_id: string;
    username: string;
    mostFrequentActivity: string;
    mostActiveTime: string;
    activityCount: number;
  }[];
}

// Admin API endpoints organized by feature
export const admin = {
  // Audit log methods
  audit: {
    getLogs: async (
      params: {
        limit?: number;
        offset?: number;
        source?: string;
        startDate?: string;
        endDate?: string;
      } = {}
    ): Promise<PaginatedResponse<AuditLog>> => {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.source) queryParams.append('source', params.source);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      return fetchWithAuth(`/api/admin/audit-logs?${queryParams.toString()}`);
    },

    getByLevel: async (
      level: string,
      params: {
        limit?: number;
        offset?: number;
        source?: string;
        startDate?: string;
        endDate?: string;
      } = {}
    ): Promise<PaginatedResponse<AuditLog>> => {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.source) queryParams.append('source', params.source);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      return fetchWithAuth(
        `/api/admin/audit-logs/${level}?${queryParams.toString()}`
      );
    },

    getSources: async (): Promise<{ sources: string[] }> => {
      return fetchWithAuth('/api/admin/audit-logs-sources');
    },

    getStats: async (): Promise<{ stats: AuditLogStats }> => {
      return fetchWithAuth('/api/admin/audit-logs-stats');
    },

    rotate: async (customRetention?: {
      info?: number;
      warn?: number;
      error?: number;
      debug?: number;
    }): Promise<{ success: boolean; message: string }> => {
      return fetchWithAuth('/api/admin/audit-logs-rotation', {
        method: 'POST',
        body: JSON.stringify({
          retentionDays: customRetention,
        }),
      });
    },

    createTest: async (data: { level: string; message: string }) => {
      return fetchWithAuth('/api/admin/audit-logs/test', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Dashboard methods
  dashboard: {
    getStats: async (): Promise<{ stats: DashboardStats }> => {
      return fetchWithAuth('/api/admin/dashboard-stats');
    },
  },

  // User management methods
  users: {
    getAll: async (
      params: {
        limit?: number;
        offset?: number;
        search?: string;
        status?: string;
        role?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      } = {}
    ): Promise<{
      users: AdminUser[];
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    }> => {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.role) queryParams.append('role', params.role);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      return fetchWithAuth(`/api/admin/users?${queryParams.toString()}`);
    },

    getOne: async (userId: string): Promise<{ user: AdminUser }> => {
      return fetchWithAuth(`/api/admin/users/${userId}`);
    },

    create: async (userData: {
      username: string;
      email: string;
      password: string;
      role: string;
      status: string;
    }): Promise<{ user: AdminUser; message: string }> => {
      return fetchWithAuth('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    update: async (
      userId: string,
      updates: {
        username?: string;
        email?: string;
        password?: string;
        role?: string;
        status?: string;
      }
    ): Promise<{ user: AdminUser; message: string }> => {
      return fetchWithAuth(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    delete: async (
      userId: string
    ): Promise<{ success: boolean; message: string }> => {
      return fetchWithAuth(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },

    changeStatus: async (
      userId: string,
      status: 'active' | 'inactive' | 'suspended' | 'pending' | 'banned',
      reason?: string
    ): Promise<{
      success: boolean;
      message: string;
      user: AdminUser;
    }> => {
      return fetchWithAuth(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
      });
    },

    resetPassword: async (
      userId: string
    ): Promise<{
      success: boolean;
      message: string;
      newPassword: string;
      user: {
        user_id: string;
        username: string;
        email: string;
      };
    }> => {
      return fetchWithAuth(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });
    },

    exportCsv: async (
      params: {
        role?: string;
        status?: string;
      } = {}
    ): Promise<Blob> => {
      const queryParams = new URLSearchParams();
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('status', params.status);

      const response = await fetch(
        `${BASE_URL}/api/admin/users-csv?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'An error occurred');
      }

      return response.blob();
    },
  },

  // System monitoring methods
  system: {
    getStats: async (): Promise<SystemStats> => {
      return fetchWithAuth('/api/admin/system-stats');
    },

    getMetrics: async () => {
      return fetchWithAuth('/api/admin/system-metrics');
    },
  },

  // Settings management
  settings: {
    get: async (): Promise<{
      settings: AppSettings;
      fromCache?: boolean;
      lastUpdated?: Date;
    }> => {
      return fetchWithAuth('/api/admin/settings');
    },

    update: async (
      settings: AppSettings
    ): Promise<{ settings: AppSettings; message: string }> => {
      return fetchWithAuth('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings }),
      });
    },
  },

  // Content management methods
  content: {
    getAll: async (
      params: {
        limit?: number;
        offset?: number;
        search?: string;
        type?: string;
        status?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      } = {}
    ): Promise<{
      content: Record<string, unknown>[];
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    }> => {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.type) queryParams.append('type', params.type);
      if (params.status) queryParams.append('status', params.status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      return fetchWithAuth(`/api/admin/content?${queryParams.toString()}`);
    },

    remove: async (
      contentId: string,
      reason: string
    ): Promise<{ success: boolean; message: string }> => {
      return fetchWithAuth(`/api/admin/content/${contentId}/remove`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
    },

    update: async (
      contentId: string,
      updates: {
        title?: string;
        status?: string;
      }
    ): Promise<{ success: boolean; message: string }> => {
      return fetchWithAuth(`/api/admin/content/${contentId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    getReports: async (
      contentId: string
    ): Promise<{ reports: Record<string, unknown>[] }> => {
      return fetchWithAuth(`/api/admin/content/${contentId}/reports`);
    },

    dismissReport: async (
      reportId: string
    ): Promise<{ success: boolean; message: string }> => {
      return fetchWithAuth(`/api/admin/reports/${reportId}/dismiss`, {
        method: 'PUT',
      });
    },

    approve: async (
      contentId: string
    ): Promise<{ success: boolean; message: string }> => {
      return fetchWithAuth(`/api/admin/content/${contentId}/approve`, {
        method: 'PUT',
      });
    },

    flag: async (
      contentId: string
    ): Promise<{ success: boolean; message: string }> => {
      return fetchWithAuth(`/api/admin/content/${contentId}/flag`, {
        method: 'PUT',
      });
    },
  },

  // Activity tracking
  activity: {
    getUserActivities: async (
      params: {
        limit?: number;
        offset?: number;
        action?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
      } = {}
    ): Promise<{
      activities: Record<string, unknown>[];
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    }> => {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.action) queryParams.append('action', params.action);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const endpoint =
        !params.userId || params.userId === 'undefined'
          ? '/api/admin/all-activities'
          : `/api/activity/user/${params.userId}`;

      return fetchWithAuth(`${endpoint}?${queryParams.toString()}`);
    },

    getStats: async (params: { days?: number } = {}) => {
      const queryParams = new URLSearchParams();
      if (params.days) queryParams.append('days', params.days.toString());

      return fetchWithAuth(
        `/api/admin/user-activity-stats?${queryParams.toString()}`
      );
    },
  },

  // Deprecated: User management methods (to be removed in future versions)
  deprecated_users: {
    getAll: async (
      params: {
        limit?: number;
        offset?: number;
        search?: string;
        status?: string;
        role?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      } = {}
    ): Promise<PaginatedResponse<AdminUser>> => {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.role) queryParams.append('role', params.role);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      return fetchWithAuth(`/api/admin/users?${queryParams.toString()}`);
    },

    getOne: async (userId: string): Promise<{ user: AdminUser }> => {
      return fetchWithAuth(`/api/admin/users/${userId}`);
    },

    create: async (userData: {
      username: string;
      email: string;
      password: string;
      role: string;
      status: string;
    }): Promise<{ user: AdminUser; message: string }> => {
      return fetchWithAuth('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    update: async (
      userId: string,
      updates: {
        username?: string;
        email?: string;
        password?: string;
        role?: string;
        status?: string;
      }
    ): Promise<{ user: AdminUser; message: string }> => {
      return fetchWithAuth(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    delete: async (
      userId: string
    ): Promise<{ success: boolean; message: string }> => {
      return fetchWithAuth(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },

    changeStatus: async (
      userId: string,
      status: 'active' | 'inactive' | 'suspended' | 'pending' | 'banned',
      reason?: string
    ): Promise<{
      success: boolean;
      message: string;
      user: AdminUser;
    }> => {
      return fetchWithAuth(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
      });
    },

    resetPassword: async (
      userId: string
    ): Promise<{
      success: boolean;
      message: string;
      newPassword: string;
      user: {
        user_id: string;
        username: string;
        email: string;
      };
    }> => {
      return fetchWithAuth(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });
    },
  },
};
