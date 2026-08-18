import { LegacyHeaderSchema, LegacyHeader } from '../legacy-header.schema';

describe('LegacyHeaderSchema', () => {
  it('should validate a valid legacy header', () => {
    const validHeader = {
      partidaId: 123,
      anio: 2024,
      indice: 1,
      codigoEspecie: 'ESP001',
      nombreEspecie: 'Especie Test',
    };

    const result = LegacyHeaderSchema.safeParse(validHeader);
    expect(result.success).toBe(true);
  });

  it('should reject header with missing fields', () => {
    const invalidHeader = {
      partidaId: 123,
      anio: 2024,
      // Missing indice, codigoEspecie, nombreEspecie
    };

    const result = LegacyHeaderSchema.safeParse(invalidHeader);
    expect(result.success).toBe(false);
  });

  it('should reject header with wrong types', () => {
    const invalidHeader = {
      partidaId: '123', // Should be number
      anio: 2024,
      indice: 1,
      codigoEspecie: 'ESP001',
      nombreEspecie: 'Especie Test',
    };

    const result = LegacyHeaderSchema.safeParse(invalidHeader);
    expect(result.success).toBe(false);
  });

  it('should produce correct LegacyHeader type', () => {
    const header: LegacyHeader = {
      partidaId: 1,
      anio: 2026,
      indice: 1,
      codigoEspecie: 'EUC01',
      nombreEspecie: 'Eucalipto',
    };
    expect(header).toBeDefined();
  });
});
