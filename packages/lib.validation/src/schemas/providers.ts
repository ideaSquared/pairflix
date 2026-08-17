import { z } from 'zod';
import { RegionSchema } from './household';

export const ProvidersQuerySchema = z.object({
  mediaType: z.enum(['movie', 'tv']),
  region: RegionSchema.optional(),
});
export type ProvidersQuery = z.infer<typeof ProvidersQuerySchema>;
