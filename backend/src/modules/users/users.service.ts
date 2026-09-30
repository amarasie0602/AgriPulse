import { NotFoundError } from '../../common/errors/http-error';
import { UserModel, type UserDoc } from '../auth/user.model';
import type { UpdateProfileInput } from './users.validation';
import type { AuthProvider, FarmProfile } from './users.types';

function toAuthProvider(user: { passwordHash?: string | null; googleId?: string | null }): AuthProvider {
  if (user.passwordHash && user.googleId) return 'both';
  return user.googleId ? 'google' : 'local';
}

function toProfile(user: UserDoc): FarmProfile {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as FarmProfile['role'],
    farmName: user.farmName ?? undefined,
    location: user.location ?? undefined,
    farmSizeHectares: user.farmSizeHectares ?? undefined,
    cropTypes: user.cropTypes ?? [],
    authProvider: toAuthProvider(user),
    createdAt: user.createdAt.toISOString(),
  };
}

export const usersService = {
  async getProfile(id: string): Promise<FarmProfile> {
    const user = await UserModel.findById(id).select('+passwordHash');
    if (!user) throw new NotFoundError('This account no longer exists.');
    return toProfile(user);
  },

  async updateProfile(id: string, input: UpdateProfileInput): Promise<FarmProfile> {
    const user = await UserModel.findById(id).select('+passwordHash');
    if (!user) throw new NotFoundError('This account no longer exists.');

    if (input.farmName !== undefined) user.farmName = input.farmName;
    if (input.location !== undefined) user.location = input.location;
    if (input.farmSizeHectares !== undefined) user.farmSizeHectares = input.farmSizeHectares;
    if (input.cropTypes !== undefined) user.cropTypes = input.cropTypes;

    await user.save();
    return toProfile(user);
  },
};
