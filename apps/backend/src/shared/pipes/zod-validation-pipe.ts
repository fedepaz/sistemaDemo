// src/shared/pipes/zod-validation-pipe.ts

import { BadRequestException, PipeTransform } from '@nestjs/common';
import { z, ZodTypeAny } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodTypeAny) {}

  transform(value: unknown): z.infer<typeof this.schema> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation error',
        errors: result.error.flatten(),
      });
    }
    return result.data;
  }
}
