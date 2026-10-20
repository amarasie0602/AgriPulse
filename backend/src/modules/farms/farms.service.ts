import { Types } from 'mongoose';
import { HttpError, NotFoundError } from '../../common/errors/http-error';
import { FarmModel, type FarmDoc } from './farm.model';
import type { CreateFarmInput, UpdateFarmInput } from './farms.validation';
import { CropModel } from '../crops/crop.model';

function validateId(id: string): void {
  if (!/^[a-f\d]{24}$/i.test(id) || !Types.ObjectId.isValid(id)) {
    throw new HttpError(400, 'Enter a valid farm identifier.');
  }
}
function toDto(farm: FarmDoc) {
  return {
    id: String(farm._id),
    farmName: farm.farmName,
    location: farm.location,
    farmSizeHectares: farm.farmSizeHectares,
    cropTypes: farm.cropTypes,
    createdAt: farm.createdAt.toISOString(),
    updatedAt: farm.updatedAt.toISOString(),
  };
}

export const farmsService = {
  async list(userId: string) {
    const farms = await FarmModel.find({ userId }).sort({ createdAt: -1 });
    return farms.map(toDto);
  },
  async get(userId: string, id: string) {
    validateId(id);
    const farm = await FarmModel.findOne({ _id: id, userId });
    if (!farm) throw new NotFoundError('This farm was not found.');
    return toDto(farm);
  },
  async create(userId: string, input: CreateFarmInput) {
    return toDto(await FarmModel.create({ ...input, userId }));
  },
  async update(userId: string, id: string, input: UpdateFarmInput) {
    validateId(id);
    const farm = await FarmModel.findOneAndUpdate({ _id: id, userId }, { $set: input }, { returnDocument: 'after', runValidators: true });
    if (!farm) throw new NotFoundError('This farm was not found.');
    return toDto(farm);
  },
  async remove(userId: string, id: string) {
    validateId(id);
    if (await CropModel.exists({ farmId: id, userId })) {
      throw new HttpError(409, 'Move or delete this farm’s crop records before deleting the farm.');
    }
    const farm = await FarmModel.findOneAndDelete({ _id: id, userId });
    if (!farm) throw new NotFoundError('This farm was not found.');
  },
};
