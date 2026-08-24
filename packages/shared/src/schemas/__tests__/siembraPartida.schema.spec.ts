// packages/shared/src/schemas/__tests__/siembraPartida.schema.spec.ts
import { SiembraPartidaSchema, CreateSiembraPartidaSchema } from "../siembraPartida.schema";

describe("SiembraPartidaSchema", () => {
  const valid = {
    id: "sp-1",
    partidaId: 100,
    anio: 2026,
    indice: 1,
    metodoMaquina: true,
    mezclaId: "mezcla-1",
    userId: "user-1",
  };

  it("accepts valid siembra partida", () => {
    const result = SiembraPartidaSchema.parse(valid);
    expect(result.id).toBe("sp-1");
    expect(result.partidaId).toBe(100);
    expect(result.metodoMaquina).toBe(true);
  });

  it("rejects missing id", () => {
    const { id, ...withoutId } = valid;
    expect(() => SiembraPartidaSchema.parse(withoutId)).toThrow();
  });

  it("rejects missing partidaId", () => {
    const { partidaId, ...withoutPartidaId } = valid;
    expect(() => SiembraPartidaSchema.parse(withoutPartidaId)).toThrow();
  });

  it("rejects non-boolean metodoMaquina", () => {
    expect(() =>
      SiembraPartidaSchema.parse({ ...valid, metodoMaquina: "yes" }),
    ).toThrow();
  });
});

describe("CreateSiembraPartidaSchema", () => {
  it("accepts valid create data", () => {
    const result = CreateSiembraPartidaSchema.parse({
      partidaId: 200,
      anio: 2026,
      indice: 2,
      metodoMaquina: false,
      mezclaId: "mezcla-2",
      userId: "user-2",
    });
    expect(result.partidaId).toBe(200);
    expect(result.metodoMaquina).toBe(false);
  });

  it("rejects missing partidaId", () => {
    expect(() =>
      CreateSiembraPartidaSchema.parse({
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        mezclaId: "mezcla-1",
        userId: "user-1",
      }),
    ).toThrow();
  });

  it("rejects missing mezclaId", () => {
    expect(() =>
      CreateSiembraPartidaSchema.parse({
        partidaId: 100,
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        userId: "user-1",
      }),
    ).toThrow();
  });
});
