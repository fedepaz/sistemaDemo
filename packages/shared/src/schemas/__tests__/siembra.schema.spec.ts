// packages/shared/src/schemas/__tests__/siembra.schema.spec.ts
import { SiembraDtoSchema } from "../siembra.schema";

describe("SiembraDtoSchema", () => {
  const valid = {
    partidaId: 1,
    anio: 2026,
    indice: 1,
    hai: "H",
    codigoEspecie: "ESP001",
    nombreEspecie: "Ave del Paraíso",
    injerto: "Injerto A",
    contenedor: "Bandeja 288",
    fechaSugeridaSiembra: "2026-07-15",
    propiedad: "Propiedad A",
    solicito: "1000",
    nrocont: "100",
    extendido: "Extendido",
    germin: "Germinación A",
  };

  it("accepts valid siembra dto", () => {
    const result = SiembraDtoSchema.parse(valid);
    expect(result.partidaId).toBe(1);
    expect(result.hai).toBe("H");
    expect(result.fechaSugeridaSiembra).toBe("2026-07-15");
  });

  it("rejects missing required fields", () => {
    const { partidaId, ...withoutPartidaId } = valid;
    expect(() => SiembraDtoSchema.parse(withoutPartidaId)).toThrow();
  });

  it("rejects missing hai", () => {
    const { hai, ...withoutHai } = valid;
    expect(() => SiembraDtoSchema.parse(withoutHai)).toThrow();
  });
});
