import { z } from 'zod';
import { EmailSchema, StrongPasswordSchema, UsernameSchema } from './auth';

const UserRoleSchema = z.enum(['user', 'admin']);
const UserStatusSchema = z.enum([
  'active',
  'inactive',
  'pending',
  'suspended',
  'banned',
]);

export const AdminPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type AdminPaginationQuery = z.infer<typeof AdminPaginationQuerySchema>;

export const AdminUserListQuerySchema = AdminPaginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  sortBy: z.enum(['createdAt', 'username', 'email', 'lastLogin']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
export type AdminUserListQuery = z.infer<typeof AdminUserListQuerySchema>;

export const AdminUsersExportQuerySchema = z.object({
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
});
export type AdminUsersExportQuery = z.infer<typeof AdminUsersExportQuerySchema>;

export const AdminCreateUserRequestSchema = z.object({
  username: UsernameSchema,
  email: EmailSchema,
  password: StrongPasswordSchema,
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
});
export type AdminCreateUserRequest = z.infer<
  typeof AdminCreateUserRequestSchema
>;

export const AdminUpdateUserRequestSchema = z.object({
  username: UsernameSchema.optional(),
  email: EmailSchema.optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
});
export type AdminUpdateUserRequest = z.infer<
  typeof AdminUpdateUserRequestSchema
>;

export const AdminChangeStatusRequestSchema = z.object({
  status: UserStatusSchema,
  reason: z.string().trim().max(500).optional(),
});
export type AdminChangeStatusRequest = z.infer<
  typeof AdminChangeStatusRequestSchema
>;

export const AdminResetPasswordRequestSchema = z.object({
  sendEmail: z.boolean().default(true),
});
export type AdminResetPasswordRequest = z.infer<
  typeof AdminResetPasswordRequestSchema
>;

export const AdminAuditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});
export type AdminAuditLogQuery = z.infer<typeof AdminAuditLogQuerySchema>;

const RetentionDaysSchema = z.object({
  info: z.number().int().positive().optional(),
  warn: z.number().int().positive().optional(),
  error: z.number().int().positive().optional(),
  debug: z.number().int().positive().optional(),
});

export const AdminAuditLogRotationRequestSchema = z.object({
  retentionDays: RetentionDaysSchema.optional(),
});
export type AdminAuditLogRotationRequest = z.infer<
  typeof AdminAuditLogRotationRequestSchema
>;

/** A nested object matching `lib/adminSettings.ts`'s `SettingsTree` shape -- validated structurally
 * as "an object" here; the leaf-level flattening/type handling happens in the lib layer, which
 * already owns the one place that shape is interpreted. */
export const AdminSettingsPatchRequestSchema = z.record(
  z.string(),
  z.unknown()
);
export type AdminSettingsPatchRequest = z.infer<
  typeof AdminSettingsPatchRequestSchema
>;

const ContentTypeSchema = z.enum(['movie', 'show', 'episode']);
const ContentStatusSchema = z.enum(['active', 'pending', 'flagged', 'removed']);

export const AdminContentListQuerySchema = AdminPaginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  type: ContentTypeSchema.optional(),
  status: ContentStatusSchema.optional(),
  sortBy: z.enum(['reportedCount', 'createdAt', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
export type AdminContentListQuery = z.infer<typeof AdminContentListQuerySchema>;

export const AdminUpdateContentRequestSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  status: ContentStatusSchema.optional(),
});
export type AdminUpdateContentRequest = z.infer<
  typeof AdminUpdateContentRequestSchema
>;

export const AdminRemoveContentRequestSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});
export type AdminRemoveContentRequest = z.infer<
  typeof AdminRemoveContentRequestSchema
>;
