import { z } from 'zod';

const farmFields = z.object({
  farmName: z.string().trim().min(1, 'Farm name is required.').max(80),
  location: z.string().trim().min(1, 'Location is required.').max(120),
  farmSizeHectares: z.number().positive('Farm area must be greater than zero.').max(1_000_000),
  cropTypes: z.array(z.string().trim().min(1).max(40)).max(12),
}).strict();

export const createFarmSchema = farmFields.extend({ cropTypes: farmFields.shape.cropTypes.default([]) });
// Update fields have no defaults: omitted values must remain unchanged in MongoDB.
export const updateFarmSchema = farmFields.partial().refine(
  (input) => Object.keys(input).length > 0,
  'Provide at least one field to update.',
);
export type CreateFarmInput = z.infer<typeof createFarmSchema>;
export type UpdateFarmInput = z.infer<typeof updateFarmSchema>;
