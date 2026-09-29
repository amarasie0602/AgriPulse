import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

/** Roles supported by the platform. Only FARMER is assigned today; ADMIN/ANALYST are reserved. */
export const ROLES = ['FARMER', 'ADMIN', 'ANALYST'] as const;
export type Role = (typeof ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    farmName: { type: String, trim: true, maxlength: 80 },
    role: { type: String, enum: ROLES, default: 'FARMER' },
  },
  { timestamps: true },
);

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const UserModel = model('User', userSchema);
