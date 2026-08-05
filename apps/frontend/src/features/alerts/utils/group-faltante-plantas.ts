import type { FaltantePlantasDto } from "@vivero/shared";

export function groupFaltantePlantas(
  data: FaltantePlantasDto[],
): FaltantePlantasDto[] {
  const seen = new Set<string>();
  const grouped = new Map<string, FaltantePlantasDto[]>();

  for (const row of data) {
    const rowKey = `${row.partidaId}-${row.anio}-${row.indice}`;
    if (seen.has(rowKey)) continue;
    seen.add(rowKey);

    const groupKey = `${row.partidaId}-${row.anio}`;
    const existing = grouped.get(groupKey);
    if (existing) {
      existing.push(row);
    } else {
      grouped.set(groupKey, [row]);
    }
  }

  const result: FaltantePlantasDto[] = [];
  for (const rows of grouped.values()) {
    if (rows.length === 1) {
      result.push(rows[0]);
    } else {
      const first = { ...rows[0] };
      first.porPr = rows.reduce((sum, r) => sum + Number(r.porPr ?? 0), 0);
      first.subRowCount = rows.length - 1;
      first.subRows = rows.map((r) => ({
        partidaId: r.partidaId,
        indice: r.indice,
      }));
      result.push(first);
    }
  }

  return result;
}
