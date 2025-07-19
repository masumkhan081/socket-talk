import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../types';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors: Record<string, string> = {};
        
        result.error.errors.forEach((error) => {
          const path = error.path.join('.');
          errors[path] = error.message;
        });

        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          errors
        };

        return res.status(400).json(response);
      }

      req.body = result.data;
      return next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: 'Validation processing failed'
      };

      return res.status(500).json(response);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors: Record<string, string> = {};
        
        result.error.errors.forEach((error) => {
          const path = error.path.join('.');
          errors[path] = error.message;
        });

        const response: ApiResponse = {
          success: false,
          message: 'Query validation failed',
          errors
        };

        return res.status(400).json(response);
      }

      req.query = result.data;
      return next();
    } catch (error) {
      console.error('Query validation middleware error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: 'Query validation processing failed'
      };

      return res.status(500).json(response);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        const errors: Record<string, string> = {};
        
        result.error.errors.forEach((error) => {
          const path = error.path.join('.');
          errors[path] = error.message;
        });

        const response: ApiResponse = {
          success: false,
          message: 'Parameter validation failed',
          errors
        };

        return res.status(400).json(response);
      }

      req.params = result.data;
      return next();
    } catch (error) {
      console.error('Parameter validation middleware error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: 'Parameter validation processing failed'
      };

      return res.status(500).json(response);
    }
  };
};
