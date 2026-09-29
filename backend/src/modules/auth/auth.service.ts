import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { ConflictError, UnauthorizedError } from '../../common/errors/http-error';
import type { LoginInput, RegisterInput } from './auth.validation';
import { UserModel } from './user.model';
import type { JwtPayload, LoginResult, PublicUser } from './auth.types';

const SALT_ROUNDS = 12;

function toPublicUser(user: { _id: unknown; name: string; email: string; role: PublicUser['role'] }): PublicUser {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

function signToken(user: PublicUser): string {
  const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
  // jsonwebtoken's types don't accept the string form of `expiresIn` directly from a plain env var.
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export const authService = {
  async register(input: RegisterInput): Promise<{ id: string }> {
    const email = input.email.toLowerCase();

    const existing = await UserModel.findOne({ email }).lean();
    if (existing) {
      throw new ConflictError('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await UserModel.create({
      name: input.name,
      email,
      passwordHash,
      farmName: input.farmName,
    });

    return { id: String(user._id) };
  },

  async login(input: LoginInput): Promise<LoginResult> {
    const email = input.email.toLowerCase();
    const user = await UserModel.findOne({ email }).select('+passwordHash');

    // Same error for "no such user" and "wrong password" so the API never
    // reveals which emails are registered.
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedError('Incorrect email or password.');
    }

    const publicUser = toPublicUser(user);
    return { access_token: signToken(publicUser), user: publicUser };
  },

  async findPublicUserById(id: string): Promise<PublicUser | null> {
    const user = await UserModel.findById(id).lean();
    return user ? toPublicUser(user) : null;
  },
};
