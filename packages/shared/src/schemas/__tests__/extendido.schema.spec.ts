// packages/shared/src/schemas/__tests__/extendido.schema.spec.ts
import { ExtendidoDtoSchema } from '../extendido.schema';

describe('ExtendidoDtoSchema', () => {
  const valid = {
    partidaId: 1,
    anio: 2026,
    indice: 1,
    hai: 'H',
    con: 50,
    codigoEspecie: 'ESP001',
    nombreEspecie: 'Ave del Paraíso',
    injerto: 'Injerto A',
    contenedor: 'Bandeja 288',
    codigoCamaraGerminacion: 10,
    fechaSugeridaSiembra: '2026-07-15',
    fechaSiembraReal: '2026-07-16',
    diasEnCamara: 7,
    fechaEgresoCamara: '2026-07-23',
    extendido: 'Extended notes',
    codigoUbicacion: 100,
    nombreUbicacion: 'Depósito A',
    stockInicial: 50,
    detalle: 'Test detail',
    baja: '5',
  };

  it('accepts valid extendido dto', () => {
    const result = ExtendidoDtoSchema.parse(valid);
    expect(result.partidaId).toBe(1);
    expect(result.codigoCamaraGerminacion).toBe(10);
    expect(result.diasEnCamara).toBe(7);
    expect(result.extendido).toBe('Extended notes');
  });

  it('accepts nullable ubicacion fields', () => {
    const result = ExtendidoDtoSchema.parse({
      ...valid,
      codigoUbicacion: null,
      nombreUbicacion: null,
      stockInicial: null,
      detalle: null,
      baja: null,
    });
    expect(result.codigoUbicacion).toBeNull();
    expect(result.nombreUbicacion).toBeNull();
    expect(result.stockInicial).toBeNull();
    expect(result.detalle).toBeNull();
    expect(result.baja).toBeNull();
  });

  it('rejects missing required fields', () => {
    const { partidaId, ...withoutPartidaId } = valid;
    expect(() => ExtendidoDtoSchema.parse(withoutPartidaId)).toThrow();
  });

  it('rejects missing codigoCamaraGerminacion', () => {
    const { codigoCamaraGerminacion, ...withoutCg } = valid;
    expect(() => ExtendidoDtoSchema.parse(withoutCg)).toThrow();
  });

  it('rejects missing extendido text', () => {
    const { extendido, ...withoutExtendido } = valid;
    expect(() => ExtendidoDtoSchema.parse(withoutExtendido)).toThrow();
  });

  it('rejects missing diasEnCamara', () => {
    const { diasEnCamara, ...withoutDias } = valid;
    expect(() => ExtendidoDtoSchema.parse(withoutDias)).toThrow();
  });
});
