// packages/shared/src/schemas/__tests__/formula.schema.spec.ts
import { FormulaSchema, CreateFormulaSchema } from "../formula.schema";

describe("FormulaSchema", () => {
  const valid = {
    id: "clx1234567890abcdef123456",
    producto1Id: "clx1234567890abcdef123467",
    producto1Nombre: "Turba",
    porcentaje1: 60,
    producto2Id: "clx1234567890abcdef123478",
    producto2Nombre: "Perlita",
    porcentaje2: 40,
    producto3Id: null,
    producto3Nombre: null,
    porcentaje3: null,
    producto4Id: null,
    producto4Nombre: null,
    porcentaje4: null,
    isActive: true,
    createdAt: new Date("2024-03-14"),
  };

  it("accepts valid fórmula with all fields", () => {
    const result = FormulaSchema.parse(valid);
    expect(result.id).toBe("clx1234567890abcdef123456");
    expect(result.porcentaje1).toBe(60);
    expect(result.producto1Nombre).toBe("Turba");
    expect(result.isActive).toBe(true);
  });

  it("accepts fórmula with only required producto", () => {
    const minimal = {
      id: "clx1234567890abcdef123501",
      producto1Id: "clx1234567890abcdef123467",
      producto1Nombre: "Turba",
      porcentaje1: 100,
      producto2Id: null,
      producto2Nombre: null,
      porcentaje2: null,
      producto3Id: null,
      producto3Nombre: null,
      porcentaje3: null,
      producto4Id: null,
      producto4Nombre: null,
      porcentaje4: null,
      isActive: true,
      createdAt: new Date("2024-03-14"),
    };
    const result = FormulaSchema.parse(minimal);
    expect(result.producto1Id).toBe("clx1234567890abcdef123467");
  });

  it("rejects missing id", () => {
    const { id, ...withoutId } = valid;
    expect(() => FormulaSchema.parse(withoutId)).toThrow();
  });

  it("rejects missing producto1Id", () => {
    const { producto1Id, ...withoutProducto1 } = valid;
    expect(() => FormulaSchema.parse(withoutProducto1)).toThrow();
  });

  it("rejects invalid producto1Id with Spanish message", () => {
    const result = FormulaSchema.safeParse({ ...valid, producto1Id: "bad" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("producto 1"))).toBe(true);
    }
  });

  it("rejects non-number porcentaje", () => {
    expect(() => FormulaSchema.parse({ ...valid, porcentaje1: "bad" })).toThrow();
  });
});

describe("CreateFormulaSchema", () => {
  it("accepts valid create data with percentages summing to 100", () => {
    const result = CreateFormulaSchema.parse({
      producto1Id: "clx1234567890abcdef123467",
      porcentaje1: 70,
      producto2Id: "clx1234567890abcdef123478",
      porcentaje2: 30,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    });
    expect(result.producto1Id).toBe("clx1234567890abcdef123467");
  });

  it("accepts single producto with 100%", () => {
    const result = CreateFormulaSchema.parse({
      producto1Id: "clx1234567890abcdef123467",
      porcentaje1: 100,
      producto2Id: null,
      porcentaje2: null,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    });
    expect(result.porcentaje1).toBe(100);
  });

  it("rejects percentages not summing to 100", () => {
    expect(() =>
      CreateFormulaSchema.parse({
        producto1Id: "clx1234567890abcdef123467",
        porcentaje1: 60,
        producto2Id: "clx1234567890abcdef123478",
        porcentaje2: 30,
        producto3Id: null,
        porcentaje3: null,
        producto4Id: null,
        porcentaje4: null,
      }),
    ).toThrow("Los porcentajes deben sumar 100%");
  });

  it("rejects missing producto1Id", () => {
    expect(() =>
      CreateFormulaSchema.parse({
        porcentaje1: 100,
        producto2Id: null,
        porcentaje2: null,
        producto3Id: null,
        porcentaje3: null,
        producto4Id: null,
        porcentaje4: null,
      }),
    ).toThrow();
  });

  it("rejects invalid producto1Id with Spanish message", () => {
    const result = CreateFormulaSchema.safeParse({
      producto1Id: "bad",
      porcentaje1: 100,
      producto2Id: null,
      porcentaje2: null,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("producto 1"))).toBe(true);
    }
  });

  it("rejects missing porcentaje1", () => {
    expect(() =>
      CreateFormulaSchema.parse({
        producto1Id: "clx1234567890abcdef123467",
        producto2Id: null,
        porcentaje2: null,
        producto3Id: null,
        porcentaje3: null,
        producto4Id: null,
        porcentaje4: null,
      }),
    ).toThrow();
  });

  it("rejects negative porcentaje1", () => {
    const result = CreateFormulaSchema.safeParse({
      producto1Id: "clx1234567890abcdef123467",
      porcentaje1: -5,
      producto2Id: null,
      porcentaje2: null,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("porcentaje1"))).toBe(true);
    }
  });

  it("rejects non-integer porcentaje1", () => {
    const result = CreateFormulaSchema.safeParse({
      producto1Id: "clx1234567890abcdef123467",
      porcentaje1: 33.3,
      producto2Id: null,
      porcentaje2: null,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("porcentaje1"))).toBe(true);
    }
  });

  it("rejects a slot with a product but no percentage", () => {
    const result = CreateFormulaSchema.safeParse({
      producto1Id: "clx1234567890abcdef123467",
      porcentaje1: 100,
      producto2Id: "clx1234567890abcdef123478",
      porcentaje2: null,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.message === "Cada producto debe tener su porcentaje",
      );
      expect(issue?.path).toEqual(["porcentaje2"]);
    }
  });

  it("rejects a slot with a percentage but no product", () => {
    const result = CreateFormulaSchema.safeParse({
      producto1Id: "clx1234567890abcdef123467",
      porcentaje1: 70,
      producto2Id: null,
      porcentaje2: 30,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.message === "Cada producto debe tener su porcentaje",
      );
      expect(issue?.path).toEqual(["producto2Id"]);
    }
  });

  it("rejects the same product in two slots", () => {
    const result = CreateFormulaSchema.safeParse({
      producto1Id: "clx1234567890abcdef123467",
      porcentaje1: 60,
      producto2Id: "clx1234567890abcdef123467",
      porcentaje2: 40,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.message === "No se puede repetir el mismo producto",
      );
      expect(issue?.path).toEqual(["producto2Id"]);
    }
  });
});
