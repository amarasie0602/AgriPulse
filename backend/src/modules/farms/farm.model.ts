import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const fieldSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    areaHectares: { type: Number, required: true, min: 0, max: 1_000_000 },
    crop: { type: String, trim: true, maxlength: 40 },
  },
);

const farmSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    location: { type: String, trim: true, maxlength: 120 },
    totalAreaHectares: { type: Number, required: true, min: 0, max: 1_000_000 },
    fields: { type: [fieldSchema], default: [] },
  },
  { timestamps: true },
);

export type FarmDoc = HydratedDocument<InferSchemaType<typeof farmSchema>>;

export const FarmModel = model('Farm', farmSchema);
