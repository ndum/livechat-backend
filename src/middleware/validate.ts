import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, z } from 'zod';
import { ValidationError } from '../utils/errors.js';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError(error.issues.map((e: z.ZodIssue) => e.message).join(', ')));
      } else {
        next(error);
      }
    }
  };
};
