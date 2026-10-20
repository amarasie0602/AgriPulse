import { z } from 'zod';

export const categories = ['Rice & paddy', 'Vegetables', 'Fruits', 'Tea', 'Coconut', 'Maize', 'Pulses & legumes', 'Tubers', 'Spices', 'Other'] as const;
export const stages = ['Planned', 'Planted', 'Growing', 'Flowering', 'Ready to harvest', 'Harvested'] as const;
const date = z.iso.date();
export const cropSchema = z.object({
  name: z.string().trim().min(1).max(80),
  farmId: z.string().regex(/^[a-f\d]{24}$/i, 'Select a valid farm.'),
  category: z.enum(categories),
  areaHectares: z.number().positive().max(1_000_000),
  plantingDate: date,
  harvestDate: date,
  stage: z.enum(stages),
  variety: z.string().trim().max(100).default(''),
  season: z.string().trim().max(80).default(''),
  notes: z.string().trim().max(2000).default(''),
}).strict().refine(input => input.harvestDate >= input.plantingDate, {
  path: ['harvestDate'], message: 'Harvest must be on or after planting.',
});
export type CropInput = z.infer<typeof cropSchema>;
