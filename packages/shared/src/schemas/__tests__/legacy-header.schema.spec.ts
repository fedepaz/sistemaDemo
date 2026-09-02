import { LegacyHeaderSchema, LegacyHeader, PartidaHeaderSchema } from '../legacy-header.schema';

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
    };

    const result = LegacyHeaderSchema.safeParse(invalidHeader);
    expect(result.success).toBe(false);
  });

  it('should reject header with wrong types', () => {
    const invalidHeader = {
      partidaId: '123',
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

  it('should have Spanish error message for empty codigoEspecie', () => {
    const result = LegacyHeaderSchema.safeParse({
      partidaId: 1,
      anio: 2026,
      indice: 1,
      codigoEspecie: '',
      nombreEspecie: 'Eucalipto',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('El código de especie es requerido');
    }
  });

  it('should have Spanish error message for empty nombreEspecie', () => {
    const result = LegacyHeaderSchema.safeParse({
      partidaId: 1,
      anio: 2026,
      indice: 1,
      codigoEspecie: 'EUC01',
      nombreEspecie: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('El nombre de especie es requerido');
    }
  });
});

describe('PartidaHeaderSchema', () => {
  it('should validate a valid header', () => {
    const result = PartidaHeaderSchema.safeParse({
      partidaId: 1,
      anio: 2026,
      indice: 1,
    });
    expect(result.success).toBe(true);
  });

  it('should reject when partidaId is missing', () => {
    const result = PartidaHeaderSchema.safeParse({ anio: 2026, indice: 1 });
    expect(result.success).toBe(false);
  });

  it('should reject when anio is missing', () => {
    const result = PartidaHeaderSchema.safeParse({ partidaId: 1, indice: 1 });
    expect(result.success).toBe(false);
  });

  it('should reject when indice is missing', () => {
    const result = PartidaHeaderSchema.safeParse({ partidaId: 1, anio: 2026 });
    expect(result.success).toBe(false);
  });
});
