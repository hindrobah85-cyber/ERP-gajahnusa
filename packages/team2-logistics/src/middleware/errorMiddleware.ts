import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: number;
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found - ${req.originalUrl}`) as ErrorWithStatus;
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (
  error: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message;

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (error.message && error.message.includes('duplicate key')) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  logger.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
};