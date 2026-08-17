import { z } from 'zod';
import { EmailSchema } from './auth';

export const CreateHouseholdRequestSchema = z.object({
  name: z.string().trim().max(80, 'Use at most 80 characters').optional(),
});
export type CreateHouseholdRequest = z.infer<
  typeof CreateHouseholdRequestSchema
>;

export const CreateInviteRequestSchema = z.object({
  email: EmailSchema.optional(),
});
export type CreateInviteRequest = z.infer<typeof CreateInviteRequestSchema>;

export const MoodSchema = z.enum([
  'funny',
  'dark',
  'feelgood',
  'tense',
  'romantic',
  'thoughtful',
  'action',
]);
export type Mood = z.infer<typeof MoodSchema>;

export const RegionSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, 'Use a 2-letter region code');

export const PickRequestSchema = z.object({
  mood: MoodSchema,
  /** Household's available time budget, in minutes -- bounds are a sanity check (no real answer
   * on either end), not a business rule. */
  minutes: z
    .number()
    .int()
    .min(15, 'Use at least 15 minutes')
    .max(600, 'Use at most 600 minutes'),
  providers: z.array(z.string().trim().min(1)).optional(),
  region: RegionSchema.optional(),
  excludeTmdbIds: z.array(z.number().int().positive()).optional(),
});
export type PickRequest = z.infer<typeof PickRequestSchema>;

export const CommitPickRequestSchema = z.object({
  mediaType: z.enum(['movie', 'tv']),
  mood: MoodSchema.optional(),
  minutes: z.number().int().positive().optional(),
});
export type CommitPickRequest = z.infer<typeof CommitPickRequestSchema>;

export const HistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type HistoryQuery = z.infer<typeof HistoryQuerySchema>;

export const HistoryPatchRequestSchema = z.object({
  enjoyed: z.boolean().nullable(),
});
export type HistoryPatchRequest = z.infer<typeof HistoryPatchRequestSchema>;

export const ProviderLaunchRequestSchema = z.object({
  providerSlug: z.string().trim().min(1, 'providerSlug is required'),
  mediaType: z.enum(['movie', 'tv']),
  region: RegionSchema.optional(),
});
export type ProviderLaunchRequest = z.infer<typeof ProviderLaunchRequestSchema>;

/** `kind` excludes 'proposed'/'accepted' (already recorded automatically by the pick and commit
 * routes) and 'provider_launched' (only recordable via the TMDb-verified launch endpoint, which
 * records it itself) -- this generic endpoint is for the funnel outcomes that have no other
 * write path. */
export const PickEventRequestSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(['movie', 'tv']),
  kind: z.enum(['swapped', 'dismissed']),
  mood: MoodSchema.optional(),
  minutesBudget: z.number().int().positive().optional(),
});
export type PickEventRequest = z.infer<typeof PickEventRequestSchema>;

export const PickEventStatsQuerySchema = z.object({
  windowDays: z.coerce.number().int().min(1).max(365).default(30),
});
export type PickEventStatsQuery = z.infer<typeof PickEventStatsQuerySchema>;
