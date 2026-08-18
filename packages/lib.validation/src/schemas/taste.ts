import { z } from 'zod';

export const TasteOnboardingSwipeSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(['movie', 'tv']),
  genreIds: z.array(z.number().int().positive()),
  verdict: z.enum(['love', 'not_for_me']),
});
export type TasteOnboardingSwipe = z.infer<typeof TasteOnboardingSwipeSchema>;

export const TasteOnboardingRequestSchema = z.object({
  likedGenreIds: z.array(z.number().int().positive()),
  swipes: z.array(TasteOnboardingSwipeSchema),
  providers: z.array(z.string().trim().min(1)),
});
export type TasteOnboardingRequest = z.infer<
  typeof TasteOnboardingRequestSchema
>;
