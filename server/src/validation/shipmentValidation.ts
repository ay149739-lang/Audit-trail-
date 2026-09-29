import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const VALID_EVENT_TYPES = [
  'CONTAINER_CREATED',
  'LOADED_ON_SHIP',
  'MOVED_LOCATION',
  'TEMPERATURE_SPIKE',
  'ARRIVED_AT_PORT',
  'CUSTOMS_CLEARED',
  'INSPECTION_PASSED',
  'DELIVERED',
] as const;

export const expectedVersionSchema = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === '') return undefined;
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && /^-?\d+(\.\d+)?$/.test(val.trim())) {
      return Number(val.trim());
    }
    return val;
  },
  z
    .number({ invalid_type_error: 'expectedVersion must be a valid integer' })
    .int('expectedVersion must be an integer')
    .nonnegative('expectedVersion cannot be negative')
    .optional()
);

export const createShipmentSchema = z.object({
  aggregateId: z
    .string({ required_error: 'aggregateId is required' })
    .trim()
    .min(1, 'aggregateId cannot be empty')
    .regex(/^[A-Za-z0-9_-]+$/, 'aggregateId must be alphanumeric (letters, numbers, hyphens, underscores)'),
  origin: z.string().trim().min(1, 'origin cannot be empty').optional(),
  destination: z.string().trim().min(1, 'destination cannot be empty').optional(),
  carrier: z.string().trim().min(1, 'carrier cannot be empty').optional(),
  vessel: z.string().trim().optional(),
  operator: z.string().trim().optional(),
  expectedVersion: expectedVersionSchema,
});

export const moveShipmentSchema = z.object({
  location: z
    .string({ required_error: 'location is required' })
    .trim()
    .min(1, 'location cannot be empty'),
  vessel: z.string().trim().optional(),
  status: z
    .enum(['CREATED', 'IN_TRANSIT', 'AT_PORT', 'CUSTOMS_CLEARED', 'DELIVERED', 'WARNING'])
    .optional(),
  operator: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  expectedVersion: expectedVersionSchema,
});

export const recordEventSchema = z.object({
  eventType: z.enum(VALID_EVENT_TYPES, {
    errorMap: () => ({
      message: `Invalid eventType. Supported types: ${VALID_EVENT_TYPES.join(', ')}`,
    }),
  }),
  payload: z
    .record(z.any())
    .refine((val) => val !== null && typeof val === 'object' && !Array.isArray(val), {
      message: 'payload must be a non-null object',
    }),
  operator: z.string().trim().optional(),
  expectedVersion: expectedVersionSchema,
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type MoveShipmentInput = z.infer<typeof moveShipmentSchema>;
export type RecordEventInput = z.infer<typeof recordEventSchema>;

/**
 * Express middleware for Zod validation on request body
 */
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue.path.join('.') || 'body';
      return res.status(400).json({
        success: false,
        error: `Validation error on ${field}: ${issue.message}`,
        code: 'VALIDATION_ERROR',
        field,
        message: issue.message,
      });
    }
    // Replace req.body with the sanitized and typed data
    req.body = result.data;
    next();
  };
};
