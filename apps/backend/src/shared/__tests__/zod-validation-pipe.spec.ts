import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({ name: z.string(), age: z.number() });
  let pipe: ZodValidationPipe<typeof schema._type>;

  beforeEach(() => {
    pipe = new ZodValidationPipe(schema);
  });

  it('returns parsed data for valid input', () => {
    const input = { name: 'Alice', age: 30 };
    const result = pipe.transform(input);
    expect(result).toEqual(input);
  });

  it('throws BadRequestException for invalid input', () => {
    const input = { name: 123, age: 'not a number' };
    expect(() => pipe.transform(input)).toThrow(BadRequestException);
  });

  it('includes validation details in error response', () => {
    const input = { name: 123, age: 'not a number' };
    try {
      pipe.transform(input);
      fail('Expected BadRequestException');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse();
      expect(response).toEqual(
        expect.objectContaining({
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: expect.objectContaining({
            fieldErrors: expect.any(Object),
            formErrors: expect.any(Array),
          }),
        }),
      );
    }
  });
});
