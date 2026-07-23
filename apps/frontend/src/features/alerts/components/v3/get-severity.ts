import type {
  SiembraRetrasadaDto,
  FaltaGerminacionDto,
  FaltantePlantasDto,
  FaltaPreExpedicionDto,
} from "@vivero/shared";

export type SeverityLevel = "critical" | "warning" | "info";

export function getSeverity(
  alert:
    | SiembraRetrasadaDto
    | FaltaGerminacionDto
    | FaltantePlantasDto
    | FaltaPreExpedicionDto,
): SeverityLevel {
  if ("germinadasTotales" in alert && "solicitadas" in alert) {
    const deficit = alert.solicitadas - alert.germinadasTotales;
    const deficitRatio = deficit / alert.solicitadas;
    return deficitRatio > 0.5 ? "critical" : "warning";
  }

  if ("fechaSugeridaSiembra" in alert) {
    return "warning";
  }

  return "info";
}
