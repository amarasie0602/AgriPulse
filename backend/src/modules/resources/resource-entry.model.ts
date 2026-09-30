import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

/** Kept small and generic for now — refined once real usage patterns are clearer. */
export const RESOURCE_TYPES = ['WATER', 'ENERGY', 'FERTILIZER', 'PESTICIDE', 'FUEL', 'OTHER'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

const resourceEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resourceType: { type: String, enum: RESOURCE_TYPES, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true, maxlength: 20 },
    date: { type: Date, required: true },
    notes: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true },
);

// Recent-first listing is the only query pattern today.
resourceEntrySchema.index({ userId: 1, date: -1 });

export type ResourceEntryDoc = HydratedDocument<InferSchemaType<typeof resourceEntrySchema>>;

export const ResourceEntryModel = model('ResourceEntry', resourceEntrySchema);
