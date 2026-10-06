import { isValidObjectId } from 'mongoose';
import { HttpError, NotFoundError } from '../../common/errors/http-error';
import { FarmModel, type FarmDoc } from './farm.model';
import type { CreateFarmInput, CreateFieldInput, UpdateFarmInput, UpdateFieldInput } from './farms.validation';
import type { FarmDto, FieldDto } from './farms.types';

function toField(field: FarmDoc['fields'][number]): FieldDto {
  return {
    id: String(field._id),
    name: field.name,
    areaHectares: field.areaHectares,
    crop: field.crop ?? undefined,
  };
}

function toFarm(farm: FarmDoc): FarmDto {
  return {
    id: String(farm._id),
    name: farm.name,
    location: farm.location ?? undefined,
    totalAreaHectares: farm.totalAreaHectares,
    fields: farm.fields.map(toField),
    createdAt: farm.createdAt.toISOString(),
  };
}

function fieldsArea(farm: FarmDoc, skipFieldId?: string): number {
  return farm.fields.reduce((sum, field) => {
    if (skipFieldId && String(field._id) === skipFieldId) return sum;
    return sum + field.areaHectares;
  }, 0);
}

function assertFits(totalAreaHectares: number, usedArea: number): void {
  if (usedArea > totalAreaHectares) {
    throw new HttpError(400, 'Field area cannot exceed the farm’s total area.');
  }
}

async function findOwned(userId: string, farmId: string): Promise<FarmDoc> {
  if (!isValidObjectId(farmId)) throw new NotFoundError('This farm could not be found.');
  const farm = await FarmModel.findOne({ _id: farmId, owner: userId });
  if (!farm) throw new NotFoundError('This farm could not be found.');
  return farm;
}

export const farmsService = {
  async list(userId: string): Promise<FarmDto[]> {
    const farms = await FarmModel.find({ owner: userId }).sort({ createdAt: -1 });
    return farms.map(toFarm);
  },

  async create(userId: string, input: CreateFarmInput): Promise<FarmDto> {
    const farm = await FarmModel.create({
      owner: userId,
      name: input.name,
      location: input.location,
      totalAreaHectares: input.totalAreaHectares,
      fields: [],
    });
    return toFarm(farm);
  },

  async getById(userId: string, farmId: string): Promise<FarmDto> {
    return toFarm(await findOwned(userId, farmId));
  },

  async update(userId: string, farmId: string, input: UpdateFarmInput): Promise<FarmDto> {
    const farm = await findOwned(userId, farmId);

    if (input.name !== undefined) farm.name = input.name;
    if (input.location !== undefined) farm.location = input.location;
    if (input.totalAreaHectares !== undefined) {
      assertFits(input.totalAreaHectares, fieldsArea(farm));
      farm.totalAreaHectares = input.totalAreaHectares;
    }

    await farm.save();
    return toFarm(farm);
  },

  async remove(userId: string, farmId: string): Promise<void> {
    const farm = await findOwned(userId, farmId);
    await farm.deleteOne();
  },

  async addField(userId: string, farmId: string, input: CreateFieldInput): Promise<FarmDto> {
    const farm = await findOwned(userId, farmId);
    assertFits(farm.totalAreaHectares, fieldsArea(farm) + input.areaHectares);
    farm.fields.push(input);
    await farm.save();
    return toFarm(farm);
  },

  async updateField(userId: string, farmId: string, fieldId: string, input: UpdateFieldInput): Promise<FarmDto> {
    const farm = await findOwned(userId, farmId);
    if (!isValidObjectId(fieldId)) throw new NotFoundError('This field could not be found.');

    const field = farm.fields.id(fieldId);
    if (!field) throw new NotFoundError('This field could not be found.');

    const nextArea = input.areaHectares ?? field.areaHectares;
    assertFits(farm.totalAreaHectares, fieldsArea(farm, fieldId) + nextArea);

    if (input.name !== undefined) field.name = input.name;
    if (input.areaHectares !== undefined) field.areaHectares = input.areaHectares;
    if (input.crop !== undefined) field.crop = input.crop;

    await farm.save();
    return toFarm(farm);
  },

  async removeField(userId: string, farmId: string, fieldId: string): Promise<FarmDto> {
    const farm = await findOwned(userId, farmId);
    if (!isValidObjectId(fieldId)) throw new NotFoundError('This field could not be found.');

    const field = farm.fields.id(fieldId);
    if (!field) throw new NotFoundError('This field could not be found.');

    field.deleteOne();
    await farm.save();
    return toFarm(farm);
  },
};
