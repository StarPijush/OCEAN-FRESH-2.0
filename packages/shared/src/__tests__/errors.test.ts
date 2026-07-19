import { describe, expect, it } from 'vitest';

import { AppError, NotFoundError, ValidationError } from '../errors/index.js';

class TestError extends AppError {
  readonly code = 'TEST_ERROR';
  readonly statusCode = 400;
  readonly severity = 'error' as const;
}

describe('AppError hierarchy', () => {
  it('should create AppError subclass with correct properties', () => {
    const err = new TestError('Something went wrong');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('TestError');
    expect(err.message).toBe('Something went wrong');
    expect(err.code).toBe('TEST_ERROR');
    expect(err.statusCode).toBe(400);
  });

  it('should create ValidationError', () => {
    const err = new ValidationError('Invalid input');
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('should create NotFoundError', () => {
    const err = new NotFoundError('Product not found');
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  it('should serialize to JSON', () => {
    const err = new ValidationError('Invalid');
    const json = err.toJSON();
    expect(json).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(json).toHaveProperty('message', 'Invalid');
    expect(json).toHaveProperty('severity', 'warning');
    expect(json).toHaveProperty('correlationId');
  });
});
