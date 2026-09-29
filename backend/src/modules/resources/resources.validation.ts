import { z } from 'zod';
import { RESOURCE_TYPES } from './resource-entry.model';

export const createResourceEntrySchema = z
  .object({
    resourceType: z.enum(RESOURCE_TYPES, { message: 'Choose a valid resource type.' }),
    quantity: z.number().positive('Quantity must be greater than 0.').max(1_000_000),
    unit: z.string().trim().min(1, 'Unit is required.').max(20, 'Unit must be 20 characters or fewer.'),
    // ISO date string (e.g. "2026-09-29"); parsed into a Date by the service.
    date: z
      .string()
      .trim()
      .min(1, 'Date is required.')
      .refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date.'),
    notes: z.string().trim().max(200, 'Notes must be 200 characters or fewer.').optional(),
  })
  .strict();

export type CreateResourceEntryInput = z.infer<typeof createResourceEntrySchema>;
