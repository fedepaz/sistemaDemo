// packages/shared/src/schemas/__tests__/siembra.schema.spec.ts
import { SiembraDtoSchema, AsignarUbiSiembraDtoSchema } from '../siembra.schema';

describe('SiembraDtoSchema', () => {
  const valid = {
    partidaId: 1,
    anio: 2026,
    indice: 1,
    hai: 'H',
    con: '50',
    codigoEspecie: 'ESP001',
    nombreEspecie: 'Ave del Paraíso',
    injerto: 'Injerto A',
    contenedor: 'Bandeja 288',
    fechaSugeridaSiembra: '2026-07-15',
    fechaSiembraReal: '2026-07-16',
  };

  it('accepts valid siembra dto', () => {
    const result = SiembraDtoSchema.parse(valid);
    expect(result.partidaId).toBe(1);
    expect(result.hai).toBe('H');
    expect(result.fechaSugeridaSiembra).toBe('2026-07-15');
  });

  it('rejects missing required fields', () => {
    const { partidaId, ...withoutPartidaId } = valid;
    expect(() => SiembraDtoSchema.parse(withoutPartidaId)).toThrow();
  });

  it('rejects missing hai', () => {
    const { hai, ...withoutHai } = valid;
    expect(() => SiembraDtoSchema.parse(withoutHai)).toThrow();
  });
});

describe('AsignarUbiSiembraDtoSchema', () => {
  const valid = {
    partida: 1,
    ano: 2026,
    indice: 1,
    ubicacion: 100,
    stock_ini: 50,
  };

  it('accepts valid assignment', () => {
    const result = AsignarUbiSiembraDtoSchema.parse(valid);
    expect(result.partida).toBe(1);
    expect(result.ubicacion).toBe(100);
  });

  it('applies default values', () => {
    const result = AsignarUbiSiembraDtoSchema.parse(valid);
    expect(result.baja).toBe(0);
    expect(result.detalle).toBe('');
    expect(result.extendido).toBe('');
  });

  it('accepts with optional fields', () => {
    const result = AsignarUbiSiembraDtoSchema.parse({
      ...valid,
      baja: 5,
      detalle: 'Test',
      extendido: 'Notes',
      edita: 'admin',
    });
    expect(result.baja).toBe(5);
    expect(result.edita).toBe('admin');
  });

  it('rejects negative ubicacion', () => {
    expect(() =>
      AsignarUbiSiembraDtoSchema.parse({ ...valid, ubicacion: -1 })
    ).toThrow();
  });

  it('rejects non-integer ubicacion', () => {
    expect(() =>
      AsignarUbiSiembraDtoSchema.parse({ ...valid, ubicacion: 1.5 })
    ).toThrow();
  });

  it('rejects detalle longer than 30 characters', () => {
    expect(() =>
      AsignarUbiSiembraDtoSchema.parse({ ...valid, detalle: 'a'.repeat(31) })
    ).toThrow();
  });
});
