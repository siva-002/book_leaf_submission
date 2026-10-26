import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  console.error(`[ErrorHandler] [${req.method}] ${req.url} - Status ${statusCode}:`, err);

  res.status(statusCode).json({
    success: false,
    error: message,
    details: err.details || undefined,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};
