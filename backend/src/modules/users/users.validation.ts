import { z } from 'zod';

/** All fields optional: this is a partial update (PATCH), not a full replace. */
export const updateProfileSchema = z
  .object({
    farmName: z.string().trim().max(80, 'Farm name must be 80 characters or fewer.').optional(),
    location: z.string().trim().max(120, 'Location must be 120 characters or fewer.').optional(),
    farmSizeHectares: z
      .number()
      .min(0, 'Farm size cannot be negative.')
      .max(1_000_000, 'That farm size looks too large — please check the value.')
      .optional(),
    cropTypes: z
      .array(z.string().trim().min(1).max(40))
      .max(12, 'List up to 12 crop types.')
      .optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
