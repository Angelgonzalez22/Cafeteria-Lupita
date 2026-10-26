/* FORMATOS DE HORA Y FECHAS DEL CALENDARIO */

export const formatTime12h = (value: string): string => {
  const match = /(?:T|^)([01]\d|2[0-3]):([0-5]\d)/.exec(value);
  if (!match) return "—";

  const hour = Number(match[1]);
  return `${hour % 12 || 12}:${match[2]} ${hour < 12 ? "AM" : "PM"}`;
};

export const formatSelectedDay = (day: string): string => {
  if (!day) return "Seleccionar día";

  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T12:00:00Z`));
};

export const calendarMonthLabel = (month: string): string => {
  return new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T12:00:00Z`));
};

export const shiftCalendarMonth = (month: string, delta: number): string => {
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + delta);
  return date.toISOString().slice(0, 7);
};

export const getBusinessToday = (): string => {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "America/Panama",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((value) => value.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};
