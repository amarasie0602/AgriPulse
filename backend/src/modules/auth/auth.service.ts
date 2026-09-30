import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env';
import { ConflictError, HttpError, UnauthorizedError } from '../../common/errors/http-error';
import type { GoogleAuthInput, LoginInput, RegisterInput } from './auth.validation';
import { UserModel } from './user.model';
import type { JwtPayload, LoginResult, PublicUser } from './auth.types';

const SALT_ROUNDS = 12;

// Constructed even without a client ID; verifyIdToken() simply isn't called unless one is set.
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

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

    // Same error for "no such user", "Google-only account" and "wrong password"
    // so the API never reveals which emails are registered or how they signed up.
    if (!user || !user.passwordHash || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedError('Incorrect email or password.');
    }

    const publicUser = toPublicUser(user);
    return { access_token: signToken(publicUser), user: publicUser };
  },

  /**
   * Verifies a Google Identity Services ID token, then signs in the matching
   * user — creating one on first sign-in, or linking Google to an existing
   * account with the same (Google-verified) email.
   */
  async loginWithGoogle(input: GoogleAuthInput): Promise<LoginResult> {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new HttpError(503, 'Google sign-in is not configured on this server.');
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: input.credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedError('Google sign-in failed. Please try again.');
    }

    if (!payload?.email) {
      throw new UnauthorizedError('Google sign-in failed. Please try again.');
    }
    if (!payload.email_verified) {
      throw new HttpError(403, 'Please verify your email with Google before continuing.');
    }

    const email = payload.email.toLowerCase();
    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await UserModel.create({
        name: payload.name?.trim() || email.split('@')[0],
        email,
        googleId: payload.sub,
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    const publicUser = toPublicUser(user);
    return { access_token: signToken(publicUser), user: publicUser };
  },

  async findPublicUserById(id: string): Promise<PublicUser | null> {
    const user = await UserModel.findById(id).lean();
    return user ? toPublicUser(user) : null;
  },
};
