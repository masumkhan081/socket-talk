import * as jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

export const generateAccessToken = (payload: { userId: string; email: string }): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '15m', // Short-lived access token
  });
};

export const generateRefreshToken = (payload: { userId: string; email: string }): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d', // Long-lived refresh token
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
};

export const generateTokenPair = (payload: { userId: string; email: string }) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const verifySocketToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    return null;
  }
};
