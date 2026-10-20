import { Schema, model } from 'mongoose';
import { categories, stages } from './crops.validation';

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
  name: { type: String, required: true, maxlength: 80 },
  category: { type: String, enum: categories, required: true },
  areaHectares: { type: Number, required: true, min: 0, max: 1_000_000 },
  plantingDate: { type: String, required: true },
  harvestDate: { type: String, required: true },
  stage: { type: String, enum: stages, required: true },
  variety: { type: String, default: '', maxlength: 100 },
  season: { type: String, default: '', maxlength: 80 },
  notes: { type: String, default: '', maxlength: 2000 },
}, { timestamps: true });
schema.index({ userId: 1, harvestDate: 1 });
schema.index({ farmId: 1, userId: 1 });
export const CropModel = model('Crop', schema);
