// packages/shared/src/schemas/__tests__/taskShift.schema.spec.ts
import {
  TaskShiftSchema,
  CreateTaskShiftSchema,
  UpdateTaskShiftSchema,
} from '../taskShift.schema';

describe('TaskShiftSchema', () => {
  const valid = {
    id: 'ts1b2c3d4-e5f6-7890-abcd-ef1234567890',
    createdByUserId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    entityId: 'e1b2c3d4-e5f6-7890-abcd-ef1234567890',
    startTime: '2026-08-11T08:00:00.000Z',
    endTime: '2026-08-11T17:00:00.000Z',
    isActive: true,
    createdAt: '2026-08-10T12:00:00.000Z',
    updatedAt: '2026-08-10T12:00:00.000Z',
    employees: [{ userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }],
  };

  it('accepts valid task shift dto', () => {
    const result = TaskShiftSchema.parse(valid);
    expect(result.id).toBe(valid.id);
    expect(result.entityId).toBe(valid.entityId);
    expect(result.employees).toHaveLength(1);
  });

  it('rejects missing required fields', () => {
    const { id, ...withoutId } = valid;
    expect(() => TaskShiftSchema.parse(withoutId)).toThrow();
  });

  it('rejects missing employees array', () => {
    const { employees, ...withoutEmployees } = valid;
    expect(() => TaskShiftSchema.parse(withoutEmployees)).toThrow();
  });

  it('accepts empty employees array', () => {
    const result = TaskShiftSchema.parse({ ...valid, employees: [] });
    expect(result.employees).toEqual([]);
  });
});

describe('CreateTaskShiftSchema', () => {
  const valid = {
    entityId: 'e1b2c3d4-e5f6-7890-abcd-ef1234567890',
    startTime: '2026-08-11T08:00:00.000Z',
    endTime: '2026-08-11T17:00:00.000Z',
    employeeUserIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
  };

  it('accepts valid create payload', () => {
    const result = CreateTaskShiftSchema.parse(valid);
    expect(result.entityId).toBe(valid.entityId);
    expect(result.employeeUserIds).toHaveLength(1);
  });

  it('rejects empty entityId', () => {
    expect(() =>
      CreateTaskShiftSchema.parse({ ...valid, entityId: '' }),
    ).toThrow();
  });

  it('rejects invalid startTime format', () => {
    expect(() =>
      CreateTaskShiftSchema.parse({ ...valid, startTime: 'not-a-date' }),
    ).toThrow();
  });

  it('rejects invalid endTime format', () => {
    expect(() =>
      CreateTaskShiftSchema.parse({ ...valid, endTime: '2026-13-99' }),
    ).toThrow();
  });

  it('rejects empty employeeUserIds array', () => {
    expect(() =>
      CreateTaskShiftSchema.parse({ ...valid, employeeUserIds: [] }),
    ).toThrow();
  });

  it('rejects employeeUserIds with empty strings', () => {
    expect(() =>
      CreateTaskShiftSchema.parse({ ...valid, employeeUserIds: [''] }),
    ).toThrow();
  });

  it('rejects missing startTime', () => {
    const { startTime, ...withoutStartTime } = valid;
    expect(() => CreateTaskShiftSchema.parse(withoutStartTime)).toThrow();
  });

  it('rejects missing endTime', () => {
    const { endTime, ...withoutEndTime } = valid;
    expect(() => CreateTaskShiftSchema.parse(withoutEndTime)).toThrow();
  });

  it('rejects missing employeeUserIds', () => {
    const { employeeUserIds, ...withoutEmployees } = valid;
    expect(() => CreateTaskShiftSchema.parse(withoutEmployees)).toThrow();
  });
});

describe('UpdateTaskShiftSchema', () => {
  it('accepts partial update with only entityId', () => {
    const result = UpdateTaskShiftSchema.parse({
      entityId: 'new-entity-id',
    });
    expect(result.entityId).toBe('new-entity-id');
  });

  it('accepts partial update with only startTime', () => {
    const result = UpdateTaskShiftSchema.parse({
      startTime: '2026-08-12T08:00:00.000Z',
    });
    expect(result.startTime).toBe('2026-08-12T08:00:00.000Z');
  });

  it('accepts partial update with only employeeUserIds', () => {
    const result = UpdateTaskShiftSchema.parse({
      employeeUserIds: ['user-1', 'user-2'],
    });
    expect(result.employeeUserIds).toHaveLength(2);
  });

  it('accepts empty object (no changes)', () => {
    const result = UpdateTaskShiftSchema.parse({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('rejects invalid startTime format', () => {
    expect(() =>
      UpdateTaskShiftSchema.parse({ startTime: 'not-a-date' }),
    ).toThrow();
  });

  it('accepts empty employeeUserIds (optional field allows any array length)', () => {
    const result = UpdateTaskShiftSchema.parse({ employeeUserIds: [] });
    expect(result.employeeUserIds).toEqual([]);
  });

  it('rejects employeeUserIds with empty strings', () => {
    expect(() =>
      UpdateTaskShiftSchema.parse({ employeeUserIds: [''] }),
    ).toThrow();
  });

  it('rejects invalid entityId format', () => {
    expect(() =>
      UpdateTaskShiftSchema.parse({ entityId: '' }),
    ).toThrow();
  });
});
