import { z } from 'zod';

/** Normalises then validates an email address. Shared by the API and the frontend forms. */
export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address');

/** Matches the current Sequelize `User` model's validation exactly. */
export const UsernameSchema = z
  .string()
  .trim()
  .min(3, 'Use at least 3 characters')
  .max(30, 'Use at most 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Letters, numbers, underscores and hyphens only');

/** At least 8 chars with a lower-case letter, an upper-case letter, and a digit. */
export const StrongPasswordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(128, 'Use at most 128 characters')
  .regex(/[a-z]/, 'Include a lower-case letter')
  .regex(/[A-Z]/, 'Include an upper-case letter')
  .regex(/[0-9]/, 'Include a number');

export const RegisterRequestSchema = z.object({
  username: UsernameSchema,
  email: EmailSchema,
  password: StrongPasswordSchema,
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Enter your password'),
  totpCode: z.string().trim().optional(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const VerifyEmailRequestSchema = z.object({ token: z.string().min(1) });
export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;

export const ForgotPasswordRequestSchema = z.object({ email: EmailSchema });
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ResendVerificationRequestSchema = z.object({ email: EmailSchema });
export type ResendVerificationRequest = z.infer<
  typeof ResendVerificationRequestSchema
>;

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1),
  password: StrongPasswordSchema,
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

const TotpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Enter the 6-digit code');

export const TotpVerifyRequestSchema = z.object({ code: TotpCodeSchema });
export type TotpVerifyRequest = z.infer<typeof TotpVerifyRequestSchema>;

export const TotpDisableRequestSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your password'),
  code: z.string().trim().min(6, 'Enter a code or backup code'),
});
export type TotpDisableRequest = z.infer<typeof TotpDisableRequestSchema>;

export const UpdateUsernameRequestSchema = z.object({
  username: UsernameSchema,
});
export type UpdateUsernameRequest = z.infer<typeof UpdateUsernameRequestSchema>;

export const UpdateEmailRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Enter your password'),
});
export type UpdateEmailRequest = z.infer<typeof UpdateEmailRequestSchema>;

export const UpdatePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: StrongPasswordSchema,
});
export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordRequestSchema>;

const PreferencesPatchSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  viewStyle: z.enum(['list', 'grid']).optional(),
  emailNotifications: z.boolean().optional(),
  autoArchiveDays: z.number().int().min(0).optional(),
  favoriteGenres: z.array(z.string()).optional(),
});

export const UpdatePreferencesRequestSchema = z.object({
  preferences: PreferencesPatchSchema,
});
export type UpdatePreferencesRequest = z.infer<
  typeof UpdatePreferencesRequestSchema
>;
