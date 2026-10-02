import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error Middleware]:', err);

  const isConcurrencyConflict =
    err.name === 'ConcurrencyError' ||
    err.statusCode === 409 ||
    (typeof err.message === 'string' && err.message.toLowerCase().includes('concurrency'));

  let statusCode = 500;
  if (isConcurrencyConflict) {
    statusCode = 409;
  } else if (typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
  } else if (typeof err.status === 'number') {
    statusCode = err.status;
  } else if (err.name === 'ZodError' || err.name === 'ValidationError') {
    statusCode = 400;
  } else if (
    err.name === 'CastError' ||
    (typeof err.message === 'string' && err.message.toLowerCase().includes('not found'))
  ) {
    statusCode = 404;
  } else if (
    typeof err.message === 'string' &&
    (err.message.includes('required') || err.message.includes('invalid') || err.message.includes('already exists'))
  ) {
    statusCode = 400;
  }

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

