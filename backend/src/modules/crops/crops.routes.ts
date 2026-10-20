import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import { HttpError, NotFoundError } from '../../common/errors/http-error';
import { FarmModel } from '../farms/farm.model';
import { CropModel } from './crop.model';
import { cropSchema, type CropInput } from './crops.validation';

export const cropsRouter = Router();
cropsRouter.use(requireAuth);
function id(value: string) {
  if (!/^[a-f\d]{24}$/i.test(value)) throw new HttpError(400, 'Enter a valid crop identifier.');
  return value;
}
function dto(record: InstanceType<typeof CropModel>) {
  const { _id, userId: _owner, __v: _version, ...fields } = record.toObject();
  return { ...fields, id: String(_id), farmId: String(fields.farmId) };
}
async function checkFarm(userId: string, input: CropInput) {
  const farm = await FarmModel.findOne({ _id: input.farmId, userId });
  if (!farm) throw new NotFoundError('Select a farm from your own directory.');
  if (input.areaHectares > farm.farmSizeHectares) throw new HttpError(400, 'Crop area cannot exceed the farm area.');
}
cropsRouter.get('/', async (req, res) => {
  res.json((await CropModel.find({ userId: req.auth!.sub }).sort({ harvestDate: 1 })).map(dto));
});
cropsRouter.post('/', validateBody(cropSchema), async (req, res) => {
  await checkFarm(req.auth!.sub, req.body);
  res.status(201).json(dto(await CropModel.create({ ...req.body, userId: req.auth!.sub })));
});
cropsRouter.get<{ id: string }>('/:id', async (req, res) => {
  const crop = await CropModel.findOne({ _id: id(req.params.id), userId: req.auth!.sub });
  if (!crop) throw new NotFoundError('Crop not found.');
  res.json(dto(crop));
});
// Full replacement keeps cross-field dates and area validation consistent on edits.
cropsRouter.put<{ id: string }>('/:id', validateBody(cropSchema), async (req, res) => {
  const crop = await CropModel.findOne({ _id: id(req.params.id), userId: req.auth!.sub });
  if (!crop) throw new NotFoundError('Crop not found.');
  await checkFarm(req.auth!.sub, req.body);
  crop.set(req.body);
  res.json(dto(await crop.save()));
});
cropsRouter.delete<{ id: string }>('/:id', async (req, res) => {
  const crop = await CropModel.findOneAndDelete({ _id: id(req.params.id), userId: req.auth!.sub });
  if (!crop) throw new NotFoundError('Crop not found.');
  res.status(204).end();
});
