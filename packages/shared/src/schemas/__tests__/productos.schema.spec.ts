// packages/shared/src/schemas/__tests__/productos.schema.spec.ts
import { ProductoSchema, CreateProductoSchema, UpdateProductoSchema } from "../productos.schema";

describe("ProductoSchema", () => {
  const valid = { id: "clx1234567890abcdef123456", nombre: "Turba", createdAt: new Date("2026-01-15") };

  it("accepts valid producto", () => {
    const result = ProductoSchema.parse(valid);
    expect(result.id).toBe("clx1234567890abcdef123456");
    expect(result.nombre).toBe("Turba");
  });

  it("rejects missing id", () => {
    const { id, ...withoutId } = valid;
    expect(() => ProductoSchema.parse(withoutId)).toThrow();
  });

  it("rejects invalid id with Spanish message", () => {
    const result = ProductoSchema.safeParse({ ...valid, id: "bad" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("producto"))).toBe(true);
    }
  });

  it("rejects missing nombre", () => {
    const { nombre, ...withoutNombre } = valid;
    expect(() => ProductoSchema.parse(withoutNombre)).toThrow();
  });
});

describe("CreateProductoSchema", () => {
  it("accepts valid create data", () => {
    const result = CreateProductoSchema.parse({ nombre: "Perlita" });
    expect(result.nombre).toBe("Perlita");
  });

  it("rejects missing nombre", () => {
    const result = CreateProductoSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty nombre with Spanish message", () => {
    const result = CreateProductoSchema.safeParse({ nombre: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("El nombre del producto es requerido");
    }
  });
});

describe("UpdateProductoSchema", () => {
  it("accepts partial update", () => {
    const result = UpdateProductoSchema.parse({ nombre: "Updated" });
    expect(result.nombre).toBe("Updated");
  });

  it("accepts empty update", () => {
    const result = UpdateProductoSchema.parse({});
    expect(result).toEqual({});
  });

  it("rejects empty nombre with Spanish message", () => {
    const result = UpdateProductoSchema.safeParse({ nombre: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("El nombre del producto es requerido");
    }
  });
});
