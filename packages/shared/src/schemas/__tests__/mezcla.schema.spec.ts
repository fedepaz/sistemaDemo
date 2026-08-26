// packages/shared/src/schemas/__tests__/mezcla.schema.spec.ts
import { MezclaSchema, CreateMezclaSchema } from "../mezcla.schema";

describe("MezclaSchema", () => {
  const valid = {
    id: "clx1234567890abcdef123456",
    sustrato1Id: "clx1234567890abcdef123467",
    sustrato1Nombre: "Turba",
    porcentaje1: 60,
    sustrato2Id: "clx1234567890abcdef123478",
    sustrato2Nombre: "Perlita",
    porcentaje2: 40,
    sustrato3Id: null,
    sustrato3Nombre: null,
    porcentaje3: null,
    sustrato4Id: null,
    sustrato4Nombre: null,
    porcentaje4: null,
    isActive: true,
    createdAt: new Date("2024-03-14"),
  };

  it("accepts valid mezcla with all fields", () => {
    const result = MezclaSchema.parse(valid);
    expect(result.id).toBe("clx1234567890abcdef123456");
    expect(result.porcentaje1).toBe(60);
    expect(result.sustrato1Nombre).toBe("Turba");
    expect(result.isActive).toBe(true);
  });

  it("accepts mezcla with only required sustrato", () => {
    const minimal = {
      id: "clx1234567890abcdef123501",
      sustrato1Id: "clx1234567890abcdef123467",
      sustrato1Nombre: "Turba",
      porcentaje1: 100,
      sustrato2Id: null,
      sustrato2Nombre: null,
      porcentaje2: null,
      sustrato3Id: null,
      sustrato3Nombre: null,
      porcentaje3: null,
      sustrato4Id: null,
      sustrato4Nombre: null,
      porcentaje4: null,
      isActive: true,
      createdAt: new Date("2024-03-14"),
    };
    const result = MezclaSchema.parse(minimal);
    expect(result.sustrato1Id).toBe("clx1234567890abcdef123467");
  });

  it("rejects missing id", () => {
    const { id, ...withoutId } = valid;
    expect(() => MezclaSchema.parse(withoutId)).toThrow();
  });

  it("rejects missing sustrato1Id", () => {
    const { sustrato1Id, ...withoutSustrato1 } = valid;
    expect(() => MezclaSchema.parse(withoutSustrato1)).toThrow();
  });

  it("rejects invalid sustrato1Id with Spanish message", () => {
    const result = MezclaSchema.safeParse({ ...valid, sustrato1Id: "bad" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("sustrato 1"))).toBe(true);
    }
  });

  it("rejects non-number porcentaje", () => {
    expect(() => MezclaSchema.parse({ ...valid, porcentaje1: "bad" })).toThrow();
  });
});

describe("CreateMezclaSchema", () => {
  it("accepts valid create data with percentages summing to 100", () => {
    const result = CreateMezclaSchema.parse({
      sustrato1Id: "clx1234567890abcdef123467",
      porcentaje1: 70,
      sustrato2Id: "clx1234567890abcdef123478",
      porcentaje2: 30,
      sustrato3Id: null,
      porcentaje3: null,
      sustrato4Id: null,
      porcentaje4: null,
    });
    expect(result.sustrato1Id).toBe("clx1234567890abcdef123467");
  });

  it("accepts single sustrato with 100%", () => {
    const result = CreateMezclaSchema.parse({
      sustrato1Id: "clx1234567890abcdef123467",
      porcentaje1: 100,
      sustrato2Id: null,
      porcentaje2: null,
      sustrato3Id: null,
      porcentaje3: null,
      sustrato4Id: null,
      porcentaje4: null,
    });
    expect(result.porcentaje1).toBe(100);
  });

  it("rejects percentages not summing to 100", () => {
    expect(() =>
      CreateMezclaSchema.parse({
        sustrato1Id: "clx1234567890abcdef123467",
        porcentaje1: 60,
        sustrato2Id: "clx1234567890abcdef123478",
        porcentaje2: 30,
        sustrato3Id: null,
        porcentaje3: null,
        sustrato4Id: null,
        porcentaje4: null,
      }),
    ).toThrow("Los porcentajes deben sumar 100%");
  });

  it("rejects missing sustrato1Id", () => {
    expect(() =>
      CreateMezclaSchema.parse({
        porcentaje1: 100,
        sustrato2Id: null,
        porcentaje2: null,
        sustrato3Id: null,
        porcentaje3: null,
        sustrato4Id: null,
        porcentaje4: null,
      }),
    ).toThrow();
  });

  it("rejects invalid sustrato1Id with Spanish message", () => {
    const result = CreateMezclaSchema.safeParse({
      sustrato1Id: "bad",
      porcentaje1: 100,
      sustrato2Id: null,
      porcentaje2: null,
      sustrato3Id: null,
      porcentaje3: null,
      sustrato4Id: null,
      porcentaje4: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("sustrato 1"))).toBe(true);
    }
  });

  it("rejects missing porcentaje1", () => {
    expect(() =>
      CreateMezclaSchema.parse({
        sustrato1Id: "clx1234567890abcdef123467",
        sustrato2Id: null,
        porcentaje2: null,
        sustrato3Id: null,
        porcentaje3: null,
        sustrato4Id: null,
        porcentaje4: null,
      }),
    ).toThrow();
  });
});
