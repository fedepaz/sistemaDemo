// packages/shared/src/schemas/__tests__/taskShift.schema.spec.ts
import {
  TaskShiftSchema,
  CreateTaskShiftSchema,
  UpdateTaskShiftSchema,
} from "../taskShift.schema";

describe("TaskShiftSchema", () => {
  const valid = {
    id: "clx1234567890abcdef123456",
    createdByUserId: "clx1234567890abcdef123467",
    entityId: "clx1234567890abcdef123478",
    partidaId: 1,
    anio: 2026,
    indice: 1,
    startTime: "2026-08-11T08:00:00.000Z",
    endTime: "2026-08-11T17:00:00.000Z",
    isActive: true,
    createdAt: "2026-08-10T12:00:00.000Z",
    updatedAt: "2026-08-10T12:00:00.000Z",
    employees: [{ userId: "clx1234567890abcdef123467" }],
  };

  it("accepts valid task shift dto", () => {
    const result = TaskShiftSchema.parse(valid);
    expect(result.id).toBe(valid.id);
    expect(result.entityId).toBe(valid.entityId);
    expect(result.employees).toHaveLength(1);
  });

  it("rejects missing required fields", () => {
    const { id, ...withoutId } = valid;
    expect(() => TaskShiftSchema.parse(withoutId)).toThrow();
  });

  it("rejects missing employees array", () => {
    const { employees, ...withoutEmployees } = valid;
    expect(() => TaskShiftSchema.parse(withoutEmployees)).toThrow();
  });

  it("accepts empty employees array", () => {
    const result = TaskShiftSchema.parse({ ...valid, employees: [] });
    expect(result.employees).toEqual([]);
  });

  it("rejects invalid employee userId with Spanish message", () => {
    const result = TaskShiftSchema.safeParse({
      ...valid,
      employees: [{ userId: "" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("empleado"))).toBe(true);
    }
  });
});

describe("CreateTaskShiftSchema", () => {
  const valid = {
    entityId: "clx1234567890abcdef123478",
    partidaId: 1,
    anio: 2026,
    indice: 1,
    startTime: "2026-08-11T08:00:00.000Z",
    endTime: "2026-08-11T17:00:00.000Z",
    employeeUserIds: ["clx1234567890abcdef123467"],
  };

  it("accepts valid create payload", () => {
    const result = CreateTaskShiftSchema.parse(valid);
    expect(result.employeeUserIds).toHaveLength(1);
  });

  it("rejects empty entityId with Spanish message", () => {
    const result = CreateTaskShiftSchema.safeParse({ ...valid, entityId: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("La entidad"))).toBe(true);
    }
  });

  it("rejects empty startTime with Spanish message", () => {
    const result = CreateTaskShiftSchema.safeParse({ ...valid, startTime: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("hora de inicio"))).toBe(true);
    }
  });

  it("rejects empty endTime with Spanish message", () => {
    const result = CreateTaskShiftSchema.safeParse({ ...valid, endTime: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("hora de fin"))).toBe(true);
    }
  });

  it("rejects empty partidaId", () => {
    expect(() =>
      CreateTaskShiftSchema.parse({ ...valid, partidaId: "" }),
    ).toThrow();
  });

  it("rejects empty anio", () => {
    expect(() => CreateTaskShiftSchema.parse({ ...valid, anio: "" })).toThrow();
  });

  it("rejects empty indice", () => {
    expect(() =>
      CreateTaskShiftSchema.parse({ ...valid, indice: "" }),
    ).toThrow();
  });

  it("accepts empty employeeUserIds array", () => {
    const result = CreateTaskShiftSchema.parse({
      ...valid,
      employeeUserIds: [],
    });
    expect(result.employeeUserIds).toEqual([]);
  });

  it("rejects employeeUserIds with empty strings with Spanish message", () => {
    const result = CreateTaskShiftSchema.safeParse({
      ...valid,
      employeeUserIds: [""],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("empleado"))).toBe(true);
    }
  });

  it("rejects missing startTime", () => {
    const { startTime, ...withoutStartTime } = valid;
    expect(() => CreateTaskShiftSchema.parse(withoutStartTime)).toThrow();
  });

  it("rejects missing endTime", () => {
    const { endTime, ...withoutEndTime } = valid;
    expect(() => CreateTaskShiftSchema.parse(withoutEndTime)).toThrow();
  });

  it("accepts missing employeeUserIds (defaults to empty array)", () => {
    const { employeeUserIds, ...withoutEmployees } = valid;
    const result = CreateTaskShiftSchema.parse(withoutEmployees);
    expect(result.employeeUserIds).toEqual([]);
  });

  it("rejects endTime before startTime with Spanish message", () => {
    const result = CreateTaskShiftSchema.safeParse({
      ...valid,
      startTime: "2026-08-11T17:00:00.000Z",
      endTime: "2026-08-11T08:00:00.000Z",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("hora de fin debe ser posterior"))).toBe(true);
    }
  });
});

describe("UpdateTaskShiftSchema", () => {
  it("accepts partial update with only startTime", () => {
    const result = UpdateTaskShiftSchema.parse({
      startTime: "2026-08-12T08:00:00.000Z",
    });
    expect(result.startTime).toBe("2026-08-12T08:00:00.000Z");
  });

  it("accepts partial update with only employeeUserIds", () => {
    const result = UpdateTaskShiftSchema.parse({
      employeeUserIds: ["clx1234567890abcdef123467", "clx1234567890abcdef123489"],
    });
    expect(result.employeeUserIds).toHaveLength(2);
  });

  it("accepts empty object (no changes)", () => {
    const result = UpdateTaskShiftSchema.parse({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("accepts empty employeeUserIds (optional field allows any array length)", () => {
    const result = UpdateTaskShiftSchema.parse({ employeeUserIds: [] });
    expect(result.employeeUserIds).toEqual([]);
  });

  it("rejects employeeUserIds with empty strings with Spanish message", () => {
    const result = UpdateTaskShiftSchema.safeParse({ employeeUserIds: [""] });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("empleado"))).toBe(true);
    }
  });

  it("ignores unknown fields like entityId (stripped by Zod)", () => {
    const result = UpdateTaskShiftSchema.parse({ entityId: "some-id" });
    expect(result).toEqual({});
  });
});
