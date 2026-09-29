import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error Middleware]:', err);

  const isConcurrencyConflict =
    err.name === 'ConcurrencyError' ||
    err.statusCode === 409 ||
    (typeof err.message === 'string' && err.message.toLowerCase().includes('concurrency'));

  const statusCode = isConcurrencyConflict
    ? 409
    : err.statusCode || (err.message?.includes('not found') ? 404 : 400);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: isConcurrencyConflict ? 'CONCURRENCY_CONFLICT' : undefined,
    expectedVersion: err.expectedVersion,
    currentVersion: err.currentVersion,
    aggregateId: err.aggregateId,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

