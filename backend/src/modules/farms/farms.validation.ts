import { z } from 'zod';

export const createFarmSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Farm name must be at least 2 characters.')
      .max(80, 'Farm name must be 80 characters or fewer.'),
    location: z.string().trim().max(120, 'Location must be 120 characters or fewer.').optional(),
    totalAreaHectares: z
      .number()
      .min(0, 'Farm size cannot be negative.')
      .max(1_000_000, 'That farm size looks too large — please check the value.'),
  })
  .strict();

export const updateFarmSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Farm name must be at least 2 characters.')
      .max(80, 'Farm name must be 80 characters or fewer.')
      .optional(),
    location: z.string().trim().max(120, 'Location must be 120 characters or fewer.').optional(),
    totalAreaHectares: z
      .number()
      .min(0, 'Farm size cannot be negative.')
      .max(1_000_000, 'That farm size looks too large — please check the value.')
      .optional(),
  })
  .strict();

export const createFieldSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Field name must be at least 2 characters.')
      .max(80, 'Field name must be 80 characters or fewer.'),
    areaHectares: z
      .number()
      .min(0, 'Field area cannot be negative.')
      .max(1_000_000, 'That field area looks too large — please check the value.'),
    crop: z.string().trim().max(40, 'Crop must be 40 characters or fewer.').optional(),
  })
  .strict();

export const updateFieldSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Field name must be at least 2 characters.')
      .max(80, 'Field name must be 80 characters or fewer.')
      .optional(),
    areaHectares: z
      .number()
      .min(0, 'Field area cannot be negative.')
      .max(1_000_000, 'That field area looks too large — please check the value.')
      .optional(),
    crop: z.string().trim().max(40, 'Crop must be 40 characters or fewer.').optional(),
  })
  .strict();

export type CreateFarmInput = z.infer<typeof createFarmSchema>;
export type UpdateFarmInput = z.infer<typeof updateFarmSchema>;
export type CreateFieldInput = z.infer<typeof createFieldSchema>;
export type UpdateFieldInput = z.infer<typeof updateFieldSchema>;
