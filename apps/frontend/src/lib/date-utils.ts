/**
 * Get the ISO week number for a given date.
 * @param date The date to calculate the week number for.
 * @returns The ISO week number.
 */
export const getISOWeek = (date: Date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  const dayNum = d.getUTCDay() || 7;

  d.setUTCDate(d.getUTCDate() + 3 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  return Math.ceil(((d.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7);
};

/**
 * Get the total number of ISO weeks in a given year.
 * @param year The year to calculate the total weeks for.
 * @returns The total number of ISO weeks (52 or 53).
 */
export const getTotalWeeks = (year: number) => {
  const d = new Date(year, 11, 31); // Dec 31st
  const week = getISOWeek(d);
  // If Dec 31st falls in week 1 of the next year, go back to the previous week
  return week === 1 ? getISOWeek(new Date(year, 11, 24)) : week;
};

/**
 * Format a date string in Spanish (Argentina) locale.
 * @param date The date to format.
 * @returns Formatted date string.
 */
export const formatSpanishDate = (date: Date) => {
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format a date in a compact numeric format (DD/MM/YYYY) for Argentina.
 * Ideal for tables and dense UI.
 */
export const formatShortDate = (date: Date | string | null | undefined) => {
  if (!date) return "-";

  let dateObj: Date;

  if (typeof date === "string") {
    // Check for YYYY-MM-DD format
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split("-").map(Number);
      dateObj = new Date(year, month - 1, day);
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) return "-";

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = String(dateObj.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
};
export function getLocalDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
