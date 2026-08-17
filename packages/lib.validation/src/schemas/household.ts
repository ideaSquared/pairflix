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

const RegionSchema = z
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
