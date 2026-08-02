import { groupFaltantePlantas } from "../group-faltante-plantas";
import type { FaltantePlantasDto } from "@vivero/shared";

const makeRow = (
  partidaId: number,
  indice: number,
  porPr: number,
  solicito: number = 1000,
  anio: number = 2026,
): FaltantePlantasDto => ({
  partidaId,
  anio,
  indice,
  codigoEspecie: "ESP001",
  nombreEspecie: "Especie Test",
  commentCount: 0,
  hai: "B",
  nrocont: "1",
  solicito,
  fPrimer: "2026-01-01",
  pr: "85",
  stIniPr: "1",
  porPr,
});

describe("groupFaltantePlantas", () => {
  it("returns single row unchanged", () => {
    const data = [makeRow(1, 0, 500)];
    const result = groupFaltantePlantas(data);
    expect(result).toHaveLength(1);
    expect(result[0].partidaId).toBe(1);
    expect(result[0].porPr).toBe(500);
    expect(result[0].subRowCount).toBeUndefined();
    expect(result[0].subRows).toBeUndefined();
  });

  it("groups rows with same partidaId, same anio, and different indice", () => {
    const data = [
      makeRow(1, 0, 300, 1000, 2026),
      makeRow(1, 1, 200, 1000, 2026),
      makeRow(1, 2, 150, 1000, 2026),
    ];
    const result = groupFaltantePlantas(data);
    expect(result).toHaveLength(1);
    expect(result[0].partidaId).toBe(1);
    expect(result[0].indice).toBe(0);
    expect(result[0].porPr).toBe(650); // 300 + 200 + 150
    expect(result[0].solicito).toBe(1000); // first row's value
    expect(result[0].subRowCount).toBe(2);
    expect(result[0].subRows).toEqual([
      { partidaId: 1, indice: 0 },
      { partidaId: 1, indice: 1 },
      { partidaId: 1, indice: 2 },
    ]);
  });

  it("does NOT group rows with same partidaId but different anio", () => {
    const data = [
      makeRow(1, 0, 300, 1000, 2025),
      makeRow(1, 1, 200, 1000, 2026),
    ];
    const result = groupFaltantePlantas(data);
    expect(result).toHaveLength(2);
    expect(result[0].anio).toBe(2025);
    expect(result[0].subRowCount).toBeUndefined();
    expect(result[1].anio).toBe(2026);
    expect(result[1].subRowCount).toBeUndefined();
  });

  it("handles multiple groups independently", () => {
    const data = [
      makeRow(1, 0, 300),
      makeRow(1, 1, 200),
      makeRow(2, 0, 400),
      makeRow(3, 0, 100),
      makeRow(3, 1, 50),
    ];
    const result = groupFaltantePlantas(data);
    expect(result).toHaveLength(3);
    expect(result.find((r) => r.partidaId === 1)?.porPr).toBe(500);
    expect(result.find((r) => r.partidaId === 1)?.subRowCount).toBe(1);
    expect(result.find((r) => r.partidaId === 2)?.porPr).toBe(400);
    expect(result.find((r) => r.partidaId === 2)?.subRowCount).toBeUndefined();
    expect(result.find((r) => r.partidaId === 3)?.porPr).toBe(150);
    expect(result.find((r) => r.partidaId === 3)?.subRowCount).toBe(1);
  });

  it("returns empty array for empty input", () => {
    expect(groupFaltantePlantas([])).toHaveLength(0);
  });

  it("skips duplicate rows with same partidaId, anio, and indice", () => {
    const data = [
      makeRow(1, 0, 300, 1000, 2026),
      makeRow(1, 0, 300, 1000, 2026), // duplicate
      makeRow(1, 1, 200, 1000, 2026),
    ];
    const result = groupFaltantePlantas(data);
    expect(result).toHaveLength(1);
    expect(result[0].porPr).toBe(500); // 300 + 200, not 300 + 300 + 200
    expect(result[0].subRowCount).toBe(1);
    expect(result[0].subRows).toEqual([
      { partidaId: 1, indice: 0 },
      { partidaId: 1, indice: 1 },
    ]);
  });

  it("preserves all fields from first row", () => {
    const data = [
      makeRow(1, 0, 300),
      makeRow(1, 1, 200),
    ];
    const result = groupFaltantePlantas(data);
    expect(result[0].hai).toBe("B");
    expect(result[0].nrocont).toBe("1");
    expect(result[0].pr).toBe("85");
    expect(result[0].stIniPr).toBe("1");
    expect(result[0].fPrimer).toBe("2026-01-01");
    expect(result[0].codigoEspecie).toBe("ESP001");
  });
});
