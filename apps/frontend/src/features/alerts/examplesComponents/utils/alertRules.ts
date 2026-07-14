import {
  AlertaSiembra,
  AlertaGerminacion,
  AlertaFaltante,
  AlertaPreExpedicion,
} from "../types";
import { getISOWeek, getWednesdayOfPreviousWeek } from "./dateUtils";

/**
 * Checks if a Delayed Sowing alert should be shown.
 * Rule: Not sowed in the scheduled week, and is not sowed/canceled yet.
 */
export function isSiembraRetrasadaActive(
  alerta: AlertaSiembra,
  currentWeekFormatted: string,
): boolean {
  // It must be in 'pendiente' state
  if (alerta.estado !== "pendiente") {
    return false;
  }

  // Compare the scheduled week with the current week.
  // Format is "YYYY-WXX", e.g. "2026-W27" < "2026-W29"
  // Since they are strings of same length and format, a direct alphabetical comparison works perfectly!
  return alerta.semanaSiembraProgramada < currentWeekFormatted;
}

/**
 * Checks if a Missing Germination Count alert should be shown.
 * Rule: Being on date (limit date arrived or passed), and doesn't have germination count.
 */
export function isFaltaGerminacionActive(
  alerta: AlertaGerminacion,
  currentDateStr: string,
): boolean {
  if (alerta.estado !== "pendiente") {
    return false;
  }
  return currentDateStr >= alerta.fechaLimiteRecuento;
}

/**
 * Checks if an Estimated Plant Shortage alert should be shown.
 * Rule: germinated totals < requested plants, and not resolved yet.
 */
export function getGerminadasTotales(alerta: AlertaFaltante): number {
  return alerta.subpartidas.reduce((sum, sub) => sum + sub.germinadas, 0);
}

export function isFaltantePlantasActive(alerta: AlertaFaltante): boolean {
  if (alerta.estado !== "pendiente") {
    return false;
  }
  const totales = getGerminadasTotales(alerta);
  return totales < alerta.solicitadas;
}

/**
 * Checks if a Missing Pre-dispatch alert should be shown.
 * Rule: Starting on Wednesday of the week before delivery, until loaded.
 */
export function getWednesdayBeforeDeliveryDateStr(
  fechaEntrega: string,
): string {
  const wednesday = getWednesdayOfPreviousWeek(fechaEntrega);
  // Format as YYYY-MM-DD
  const yyyy = wednesday.getFullYear();
  const mm = (wednesday.getMonth() + 1).toString().padStart(2, "0");
  const dd = wednesday.getDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isFaltaPreExpedicionActive(
  alerta: AlertaPreExpedicion,
  currentDateStr: string,
): boolean {
  if (alerta.preExpedicionCargada) {
    return false;
  }
  const activationDateStr = getWednesdayBeforeDeliveryDateStr(
    alerta.fechaEntrega,
  );
  return currentDateStr >= activationDateStr;
}
