import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { AppError } from '../utils/errors.js';
import logger from '../config/logger.js';
import { getEnv } from '../config/env.js';

const env = getEnv();

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      body: req.body,
    },
  });

  // Default error
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: Array<{ path: string; message: string }> | undefined;

  // Handle known error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    errors = err.issues.map((e: z.ZodIssue) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    error: message,
    ...(errors && { errors }),
    // Include stack trace only in development to avoid leaking implementation details
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Wraps async route handlers to automatically catch errors and pass to error middleware
 * Without this, unhandled promise rejections would crash the server
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
