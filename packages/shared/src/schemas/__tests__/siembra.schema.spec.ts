// packages/shared/src/schemas/__tests__/siembra.schema.spec.ts
import { SiembraDtoSchema } from "../siembra.schema";

describe("SiembraDtoSchema", () => {
  const valid = {
    partidaId: 1,
    anio: 2026,
    indice: 1,
    codigoEspecie: "ESP001",
    nombreEspecie: "Ave del Paraíso",
    propiedad: "Propiedad A",
    injerto: "Injerto A",
    nrocont: "100",
    sem_siembra: "S1-2026",
    fechaSugeridaSiembra: "2026-07-15",
    fechaSiembraReal: "2026-07-16",
    lote: "L001",
    anoLote: "2026",
    item: 1,
    semxgr: "2",
    c: "3",
    g: "4",
  };

  it("accepts valid siembra dto", () => {
    const result = SiembraDtoSchema.parse(valid);
    expect(result.partidaId).toBe(1);
    expect(result.sem_siembra).toBe("S1-2026");
    expect(result.fechaSugeridaSiembra).toBe("2026-07-15");
  });

  it("rejects missing required fields", () => {
    const { partidaId, ...withoutPartidaId } = valid;
    expect(() => SiembraDtoSchema.parse(withoutPartidaId)).toThrow();
  });

  it("rejects missing sem_siembra", () => {
    const { sem_siembra, ...withoutSemSiembra } = valid;
    expect(() => SiembraDtoSchema.parse(withoutSemSiembra)).toThrow();
  });
});
