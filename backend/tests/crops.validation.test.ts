import { describe, expect, it } from 'vitest';
import { cropSchema, categories } from '../src/modules/crops/crops.validation';

const input = { name: ' Samba ', farmId: '1234567890abcdef12345678', category: 'Rice & paddy', areaHectares: 2, plantingDate: '2026-10-20', harvestDate: '2027-02-10', stage: 'Planted' };
describe('Crop validation', () => {
  it('supports every crop category and trims user-defined names', () => {
    for (const category of categories) expect(cropSchema.parse({ ...input, category }).name).toBe('Samba');
  });
  it('rejects harvest before planting and invalid calendar dates', () => {
    expect(cropSchema.safeParse({ ...input, harvestDate: '2026-01-01' }).success).toBe(false);
    expect(cropSchema.safeParse({ ...input, plantingDate: '2026-02-30' }).success).toBe(false);
  });
  it('rejects invalid area, ownership injection, and unknown stages', () => {
    for (const areaHectares of [0, -1, Infinity, NaN, '2']) expect(cropSchema.safeParse({ ...input, areaHectares }).success).toBe(false);
    expect(cropSchema.safeParse({ ...input, userId: 'another-owner' }).success).toBe(false);
    expect(cropSchema.safeParse({ ...input, stage: 'automatic' }).success).toBe(false);
  });
});
