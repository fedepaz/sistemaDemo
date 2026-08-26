// packages/shared/src/schemas/__tests__/taskShift.schema.spec.ts
import {
  TaskShiftSchema,
  CreateTaskShiftSchema,
  UpdateTaskShiftSchema,
} from "../taskShift.schema";

describe("TaskShiftSchema", () => {
  const valid = {
    id: "clx1234567890abcdef12345",
    createdByUserId: "clx1234567890abcdef12346",
    entityId: "clx1234567890abcdef12347",
    partidaId: 1,
    anio: 2026,
    indice: 1,
    startTime: "2026-08-11T08:00:00.000Z",
    endTime: "2026-08-11T17:00:00.000Z",
    isActive: true,
    createdAt: "2026-08-10T12:00:00.000Z",
    updatedAt: "2026-08-10T12:00:00.000Z",
    employees: [{ userId: "clx1234567890abcdef12346" }],
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
});

describe("CreateTaskShiftSchema", () => {
  const valid = {
    entityId: "clx1234567890abcdef12347",
    partidaId: 1,
    anio: 2026,
    indice: 1,
    startTime: "2026-08-11T08:00:00.000Z",
    endTime: "2026-08-11T17:00:00.000Z",
    employeeUserIds: ["clx1234567890abcdef12346"],
  };

  it("accepts valid create payload", () => {
    const result = CreateTaskShiftSchema.parse(valid);

    expect(result.employeeUserIds).toHaveLength(1);
  });

  it("rejects empty entityId", () => {
    expect(() =>
      CreateTaskShiftSchema.parse({ ...valid, entityId: "" }),
    ).toThrow();
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

  it("rejects invalid startTime format", () => {
    expect(() =>
      CreateTaskShiftSchema.parse({ ...valid, startTime: "not-a-date" }),
    ).toThrow();
  });

  it("rejects invalid endTime format", () => {
    expect(() =>
      CreateTaskShiftSchema.parse({ ...valid, endTime: "2026-13-99" }),
    ).toThrow();
  });

  it("accepts empty employeeUserIds array", () => {
    const result = CreateTaskShiftSchema.parse({
      ...valid,
      employeeUserIds: [],
    });
    expect(result.employeeUserIds).toEqual([]);
  });

  it("rejects employeeUserIds with empty strings", () => {
    expect(() =>
      CreateTaskShiftSchema.parse({ ...valid, employeeUserIds: [""] }),
    ).toThrow();
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

  it("rejects endTime before startTime", () => {
    expect(() =>
      CreateTaskShiftSchema.parse({
        ...valid,
        startTime: "2026-08-11T17:00:00.000Z",
        endTime: "2026-08-11T08:00:00.000Z",
      }),
    ).toThrow();
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
      employeeUserIds: ["clx1234567890abcdef12346", "clx1234567890abcdef12348"],
    });
    expect(result.employeeUserIds).toHaveLength(2);
  });

  it("accepts empty object (no changes)", () => {
    const result = UpdateTaskShiftSchema.parse({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("rejects invalid startTime format", () => {
    expect(() =>
      UpdateTaskShiftSchema.parse({ startTime: "not-a-date" }),
    ).toThrow();
  });

  it("accepts empty employeeUserIds (optional field allows any array length)", () => {
    const result = UpdateTaskShiftSchema.parse({ employeeUserIds: [] });
    expect(result.employeeUserIds).toEqual([]);
  });

  it("rejects employeeUserIds with empty strings", () => {
    expect(() =>
      UpdateTaskShiftSchema.parse({ employeeUserIds: [""] }),
    ).toThrow();
  });

  it("ignores unknown fields like entityId (stripped by Zod)", () => {
    const result = UpdateTaskShiftSchema.parse({ entityId: "some-id" });
    expect(result).toEqual({});
  });
});
