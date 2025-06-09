// User management related types

export type UserRole = 'user' | 'moderator' | 'admin';
export type UserStatus =
  | 'active'
  | 'suspended'
  | 'pending'
  | 'inactive'
  | 'banned';

export interface User {
  id: string;
  user_id?: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  name?: string;
  created_at: string;
  last_login?: string | null;
}

export interface UserActivity {
  log_id: string;
  user_id: string;
  action: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface UserManagementFilters {
  roleFilter: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
