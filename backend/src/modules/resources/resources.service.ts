import { Types } from 'mongoose';
import { ForbiddenError, HttpError, NotFoundError } from '../../common/errors/http-error';
import { FarmModel } from '../farms/farm.model';
import { CropModel } from '../crops/crop.model';
import { ResourceEntryModel, type ResourceEntryDoc, type ResourceType } from './resource-entry.model';
import type { CreateResourceEntryInput } from './resources.validation';
import type { ResourceEntryDto, ResourceSummary } from './resources.types';

/** Entries older than this never show up — keeps the list and summary bounded and fast. */
const LIST_LIMIT = 200;

function toDto(entry: ResourceEntryDoc): ResourceEntryDto {
  return {
    id: String(entry._id),
    farmId: entry.farmId ? String(entry.farmId) : null,
    cropId: entry.cropId ? String(entry.cropId) : null,
    resourceType: entry.resourceType as ResourceType,
    quantity: entry.quantity,
    unit: entry.unit,
    date: entry.date.toISOString(),
    notes: entry.notes ?? undefined,
    createdAt: entry.createdAt.toISOString(),
  };
}

async function validateParents(userId: string, farmId: string | null, cropId: string | null) {
  if (cropId && !farmId) throw new HttpError(400, 'Select a farm before assigning a crop.');
  if (farmId && !await FarmModel.exists({ _id: farmId, userId })) throw new NotFoundError('Select a farm from your own directory.');
  if (cropId && !await CropModel.exists({ _id: cropId, farmId, userId })) throw new NotFoundError('Select a crop belonging to this farm and your account.');
}

export const resourcesService = {
  async update(userId: string, entryId: string, input: CreateResourceEntryInput): Promise<ResourceEntryDto> {
    const entry = Types.ObjectId.isValid(entryId) ? await ResourceEntryModel.findOne({ _id: entryId, userId }) : null;
    if (!entry) throw new NotFoundError('This entry no longer exists.');
    const farmId = input.farmId === undefined ? (entry.farmId ? String(entry.farmId) : null) : input.farmId;
    const cropId = input.cropId === undefined ? (entry.cropId ? String(entry.cropId) : null) : input.cropId;
    await validateParents(userId, farmId, cropId);
    entry.set({ ...input, farmId, cropId, notes: input.notes ?? '', date: new Date(input.date) });
    return toDto(await entry.save());
  },
  async create(userId: string, input: CreateResourceEntryInput): Promise<ResourceEntryDto> {
    await validateParents(userId, input.farmId ?? null, input.cropId ?? null);
    const entry = await ResourceEntryModel.create({
      userId,
      farmId: input.farmId ?? null,
      cropId: input.cropId ?? null,
      resourceType: input.resourceType,
      quantity: input.quantity,
      unit: input.unit,
      date: new Date(input.date),
      notes: input.notes,
    });
    return toDto(entry);
  },

  async list(userId: string): Promise<ResourceEntryDto[]> {
    const entries = await ResourceEntryModel.find({ userId }).sort({ date: -1 }).limit(LIST_LIMIT);
    return entries.map(toDto);
  },

  async remove(userId: string, entryId: string): Promise<void> {
    const entry = Types.ObjectId.isValid(entryId) ? await ResourceEntryModel.findById(entryId) : null;
    if (!entry) throw new NotFoundError('This entry no longer exists.');
    if (String(entry.userId) !== userId) throw new ForbiddenError('You do not have access to this entry.');
    await entry.deleteOne();
  },

  /** All-time total quantity per resource type, for the dashboard and (later) the carbon calculator. */
  async summary(userId: string): Promise<ResourceSummary> {
    // Aggregate pipelines don't auto-cast query values the way find() does.
    const rows = await ResourceEntryModel.aggregate<{ _id: ResourceType; total: number }>([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $group: { _id: '$resourceType', total: { $sum: '$quantity' } } },
    ]);

    const summary: ResourceSummary = {};
    for (const row of rows) summary[row._id] = row.total;
    return summary;
  },
};
