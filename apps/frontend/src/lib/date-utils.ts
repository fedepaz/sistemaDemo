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
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
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
