import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const farmSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  farmName: { type: String, required: true, trim: true, maxlength: 80 },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  farmSizeHectares: { type: Number, required: true, min: 0, max: 1_000_000 },
  cropTypes: { type: [String], default: [] },
}, { timestamps: true });

// All reads and writes are scoped to an owner; newest records appear first.
farmSchema.index({ userId: 1, createdAt: -1 });
export type FarmDoc = HydratedDocument<InferSchemaType<typeof farmSchema>>;
export const FarmModel = model('Farm', farmSchema);
