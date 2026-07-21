// packages/shared/src/schemas/__tests__/alerts.schema.spec.ts
import {
  SiembraRetrasadaDtoSchema,
  FaltaGerminacionDtoSchema,
  FaltantePlantasDtoSchema,
  FaltaPreExpedicionDtoSchema,
} from '../alerts.schema';

describe('SiembraRetrasadaDtoSchema', () => {
  const valid = {
    partidaId: 1,
    anio: 2026,
    indice: 1,
    codigoEspecie: 'ESP001',
    nombreEspecie: 'Ave del Paraíso',
    fechaSugeridaSiembra: '2026-07-15',
    contenedor: 'Bandeja 288',
    con: 50,
  };

  it('accepts valid siembra retrasada', () => {
    const result = SiembraRetrasadaDtoSchema.parse(valid);
    expect(result.partidaId).toBe(1);
    expect(result.codigoEspecie).toBe('ESP001');
  });

  it('rejects missing required fields', () => {
    expect(() => SiembraRetrasadaDtoSchema.parse({ partidaId: 1 })).toThrow();
  });
});

describe('FaltaGerminacionDtoSchema', () => {
  const valid = {
    partidaId: 1,
    anio: 2026,
    indice: 1,
    codigoEspecie: 'ESP001',
    nombreEspecie: 'Ave del Paraíso',
    contenedor: 'Bandeja 288',
    invernadero: 'INV-01',
  };

  it('accepts valid falta germinacion', () => {
    const result = FaltaGerminacionDtoSchema.parse(valid);
    expect(result.invernadero).toBe('INV-01');
  });

  it('rejects missing invernadero', () => {
    const { invernadero, ...withoutInvernadero } = valid;
    expect(() => FaltaGerminacionDtoSchema.parse(withoutInvernadero)).toThrow();
  });
});

describe('FaltantePlantasDtoSchema', () => {
  const valid = {
    partidaId: 1,
    anio: 2026,
    indice: 1,
    codigoEspecie: 'ESP001',
    nombreEspecie: 'Ave del Paraíso',
    solicitadas: 1000,
    germinadasTotales: 850,
    invernadero: 'INV-01',
  };

  it('accepts valid faltante plantas', () => {
    const result = FaltantePlantasDtoSchema.parse(valid);
    expect(result.solicitadas).toBe(1000);
    expect(result.germinadasTotales).toBe(850);
  });

  it('rejects missing required numeric fields', () => {
    const { solicitadas, ...withoutSolicitadas } = valid;
    expect(() => FaltantePlantasDtoSchema.parse(withoutSolicitadas)).toThrow();
  });
});

describe('FaltaPreExpedicionDtoSchema', () => {
  const valid = {
    partidaId: 1,
    anio: 2026,
    indice: 1,
    codigoEspecie: 'ESP001',
    nombreEspecie: 'Ave del Paraíso',
    fechaEntrega: '2026-07-20',
    invernadero: 'INV-01',
  };

  it('accepts valid falta pre-expedicion', () => {
    const result = FaltaPreExpedicionDtoSchema.parse(valid);
    expect(result.fechaEntrega).toBe('2026-07-20');
  });

  it('rejects missing fechaEntrega', () => {
    const { fechaEntrega, ...withoutFecha } = valid;
    expect(() => FaltaPreExpedicionDtoSchema.parse(withoutFecha)).toThrow();
  });
});
