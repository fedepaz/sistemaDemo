// packages/shared/src/schemas/__tests__/siembraPartida.schema.spec.ts
import {
  SiembraPartidaSchema,
  CreateSiembraPartidaSchema,
  ProfundidadSemillaSchema,
} from "../siembraPartida.schema";

describe("SiembraPartidaSchema", () => {
  const valid = {
    id: "clx1234567890abcdef123456",
    partidaId: 100,
    anio: 2026,
    indice: 1,
    metodoMaquina: true,
    presionSemilla: 25,
    profundidadSemilla: "1.525",
    tratamientoSemilla: "1",
    mezclaId: "clx1234567890abcdef123467",
    userId: "clx1234567890abcdef123478",
  };

  it("accepts valid siembra partida", () => {
    const result = SiembraPartidaSchema.parse(valid);
    expect(result.id).toBe("clx1234567890abcdef123456");
    expect(result.partidaId).toBe(100);
    expect(result.metodoMaquina).toBe(true);
    expect(result.presionSemilla).toBe(25);
    expect(result.profundidadSemilla).toBe("1.525");
    expect(result.tratamientoSemilla).toBe("1");
  });

  it("rejects missing id", () => {
    const { id, ...withoutId } = valid;
    expect(() => SiembraPartidaSchema.parse(withoutId)).toThrow();
  });

  it("rejects invalid id with Spanish message", () => {
    const result = SiembraPartidaSchema.safeParse({ ...valid, id: "bad-id" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("registro de siembra"))).toBe(true);
    }
  });

  it("rejects missing mezclaId", () => {
    const { mezclaId, ...withoutMezcla } = valid;
    expect(() => SiembraPartidaSchema.parse(withoutMezcla)).toThrow();
  });

  it("rejects invalid mezclaId with Spanish message", () => {
    const result = SiembraPartidaSchema.safeParse({ ...valid, mezclaId: "bad" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("La mezcla"))).toBe(true);
    }
  });

  it("rejects non-boolean metodoMaquina", () => {
    expect(() =>
      SiembraPartidaSchema.parse({ ...valid, metodoMaquina: "yes" }),
    ).toThrow();
  });

  it("rejects non-integer presionSemilla", () => {
    expect(() =>
      SiembraPartidaSchema.parse({ ...valid, presionSemilla: 25.5 }),
    ).toThrow();
  });

  it("rejects empty string tratamientoSemilla", () => {
    expect(() =>
      SiembraPartidaSchema.parse({ ...valid, tratamientoSemilla: "" }),
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
      presionSemilla: 30,
      profundidadSemilla: "2.000",
      tratamientoSemilla: "1",
      mezclaId: "clx1234567890abcdef123489",
    });
    expect(result.partidaId).toBe(200);
    expect(result.metodoMaquina).toBe(false);
    expect(result.profundidadSemilla).toBe("2.000");
  });

  it("accepts creation without mezclaId", () => {
    const result = CreateSiembraPartidaSchema.parse({
      partidaId: 200,
      anio: 2026,
      indice: 2,
      metodoMaquina: false,
      presionSemilla: 30,
      profundidadSemilla: "2.000",
      tratamientoSemilla: "1",
    });
    expect(result.mezclaId).toBeUndefined();
  });

  it("rejects missing partidaId", () => {
    expect(() =>
      CreateSiembraPartidaSchema.parse({
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        presionSemilla: 20,
        profundidadSemilla: "1.5",
    tratamientoSemilla: "1",
        mezclaId: "clx1234567890abcdef123467",
      }),
    ).toThrow();
  });

  it("rejects invalid mezclaId with Spanish message", () => {
    const result = CreateSiembraPartidaSchema.safeParse({
      partidaId: 100,
      anio: 2026,
      indice: 1,
      metodoMaquina: true,
      presionSemilla: 20,
      profundidadSemilla: "1.5",
      tratamientoSemilla: "1",
      mezclaId: "bad",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("ID"))).toBe(true);
    }
  });
});

describe("ProfundidadSemillaSchema", () => {
  it("accepts decimal string", () => {
    expect(ProfundidadSemillaSchema.parse("1.525")).toBe("1.525");
  });

  it("accepts whole number string", () => {
    expect(ProfundidadSemillaSchema.parse("2")).toBe("2");
  });

  it("accepts single decimal", () => {
    expect(ProfundidadSemillaSchema.parse("0.5")).toBe("0.5");
  });

  it("accepts two-digit integer", () => {
    expect(ProfundidadSemillaSchema.parse("10")).toBe("10");
  });

  it("rejects too many decimals", () => {
    expect(() => ProfundidadSemillaSchema.parse("1.5256")).toThrow();
  });

  it("rejects non-numeric string", () => {
    expect(() => ProfundidadSemillaSchema.parse("abc")).toThrow();
  });

  it("rejects empty string with Spanish message", () => {
    const result = ProfundidadSemillaSchema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("profundidad");
    }
  });

  it("rejects string with leading dot", () => {
    expect(() => ProfundidadSemillaSchema.parse(".5")).toThrow();
  });

  it("rejects three-digit integer", () => {
    expect(() => ProfundidadSemillaSchema.parse("100")).toThrow();
  });
});
