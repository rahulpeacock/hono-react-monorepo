import { env } from '@/api/lib/env';
import type { User } from '@/api/schemas/db';
import { sign } from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';

export const jwtToken = {
  accessTokenExpiration: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // Expire in 7 days
};

export async function generateAccessToken(payload: Pick<User, 'id' | 'email' | 'user_metadata'>): Promise<string> {
  const jwtPayload: JWTPayload = {
    ...payload,
    exp: jwtToken.accessTokenExpiration, // Expire in 7 days
  };
  const token = await sign(jwtPayload, env.ACCESS_TOKEN_SECRET);
  return token;
}

export async function generateRefreshToken(payload: Pick<User, 'id' | 'email' | 'user_metadata'>): Promise<string> {
  const jwtPayload: JWTPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 21, // Expire in 21 days
  };
  const token = await sign(jwtPayload, env.ACCESS_TOKEN_SECRET);
  return token;
}
