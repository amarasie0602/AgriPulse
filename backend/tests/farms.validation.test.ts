import { describe, expect, it } from 'vitest';
import { createFarmSchema, updateFarmSchema } from '../src/modules/farms/farms.validation';

const valid = { farmName: 'Green Valley', location: 'Kandy', farmSizeHectares: 12.5, cropTypes: ['Rice'] };
describe('Farm input validation', () => {
  it('trims fields and supplies an empty crop list on creation', () => {
    expect(createFarmSchema.parse({ farmName: ' Valley ', location: ' Kandy ', farmSizeHectares: 2 })).toEqual({ farmName: 'Valley', location: 'Kandy', farmSizeHectares: 2, cropTypes: [] });
  });
  it.each([0, -1, Infinity, NaN, 1_000_001, '12.5'])('rejects an invalid area: %s', area => {
    expect(createFarmSchema.safeParse({ ...valid, farmSizeHectares: area }).success).toBe(false);
  });
  it.each(['', '   ', 'x'.repeat(81)])('rejects missing or overlong names', farmName => {
    expect(createFarmSchema.safeParse({ ...valid, farmName }).success).toBe(false);
  });
  it('rejects missing locations, owner overrides, and unexpected status fields', () => {
    expect(createFarmSchema.safeParse({ ...valid, location: ' ' }).success).toBe(false);
    expect(createFarmSchema.safeParse({ ...valid, userId: 'another-owner' }).success).toBe(false);
    expect(createFarmSchema.safeParse({ ...valid, status: 'active' }).success).toBe(false);
  });
  it('rejects excessive crop names or counts', () => {
    expect(createFarmSchema.safeParse({ ...valid, cropTypes: ['x'.repeat(41)] }).success).toBe(false);
    expect(createFarmSchema.safeParse({ ...valid, cropTypes: Array(13).fill('Rice') }).success).toBe(false);
  });
  it('requires a nonempty patch without clearing omitted crop types', () => {
    expect(updateFarmSchema.safeParse({}).success).toBe(false);
    expect(updateFarmSchema.parse({ location: 'Matale' })).toEqual({ location: 'Matale' });
  });
});
