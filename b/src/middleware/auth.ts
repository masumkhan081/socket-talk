import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthenticatedRequest, JWTPayload, ApiResponse } from '../types';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Access token required',
        error: 'No token provided'
      };
      return res.status(401).json(response);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
        error: 'Invalid token'
      };
      return res.status(401).json(response);
    }

    req.userId = decoded.userId;
    req.user = user;
    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    let message = 'Invalid token';
    if (error instanceof jwt.TokenExpiredError) {
      message = 'Token expired';
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = 'Invalid token format';
    }

    const response: ApiResponse = {
      success: false,
      message,
      error: 'Authentication failed'
    };

    return res.status(401).json(response);
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const user = await User.findById(decoded.userId).select('-password');
    if (user) {
      req.userId = decoded.userId;
      req.user = user;
    }

    return next();
  } catch (error) {
    // For optional auth, we don't return an error, just continue without setting user
    return next();
  }
};

export const requireEmailVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.isEmailVerified) {
      const response: ApiResponse = {
        success: false,
        message: 'Email verification required',
        error: 'Please verify your email address before accessing this resource'
      };
      return res.status(403).json(response);
    }

    return next();
  } catch (error) {
    console.error('Email verification check error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      error: 'Email verification check failed'
    };

    return res.status(500).json(response);
  }
};
