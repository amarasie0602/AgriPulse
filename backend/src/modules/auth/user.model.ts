import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

/** Roles supported by the platform. Only FARMER is assigned today; ADMIN/ANALYST are reserved. */
export const ROLES = ['FARMER', 'ADMIN', 'ANALYST'] as const;
export type Role = (typeof ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Optional: accounts created via Google sign-in have no password.
    passwordHash: { type: String, select: false },
    // Set once a user signs in with Google, whether the account started as
    // local (linked by verified email) or was created by Google sign-in.
    googleId: { type: String, unique: true, sparse: true },
    farmName: { type: String, trim: true, maxlength: 80 },
    location: { type: String, trim: true, maxlength: 120 },
    farmSizeHectares: { type: Number, min: 0, max: 1_000_000 },
    cropTypes: { type: [String], default: [] },
    role: { type: String, enum: ROLES, default: 'FARMER' },
  },
  { timestamps: true },
);

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const UserModel = model('User', userSchema);
