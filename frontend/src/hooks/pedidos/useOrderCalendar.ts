/* MES Y SELECCIÓN DEL CALENDARIO DE PEDIDOS */

import { useState } from "react";
import type { CalendarDay } from "../../models/common/calendar";
import { calendarMonthLabel, shiftCalendarMonth } from "../../utils/date";

export const useOrderCalendar = (value: string, today: string, visible: boolean) => {
  const [month, setMonth] = useState(value.slice(0, 7));
  const [selection, setSelection] = useState({ value, visible });

  if (selection.value !== value || selection.visible !== visible) {
    setSelection({ value, visible });
    if (visible) setMonth(value.slice(0, 7));
  }

  const first = new Date(`${month}-01T12:00:00Z`);
  const offset = (first.getUTCDay() + 6) % 7;
  const last = new Date(first);
  last.setUTCMonth(last.getUTCMonth() + 1, 0);
  const totalCells = Math.ceil((offset + last.getUTCDate()) / 7) * 7;
  const days: CalendarDay[] = Array.from({ length: totalCells }, (_, index) => {
    const number = index - offset + 1;
    const valid = number > 0 && number <= last.getUTCDate();
    const key = valid ? `${month}-${String(number).padStart(2, "0")}` : `blank-${index}`;
    return { key, number: valid ? number : null, disabled: !valid || key > today };
  });
  const canNext = month < today.slice(0, 7);

  const previous = () => setMonth((current) => shiftCalendarMonth(current, -1));
  const next = () => {
    if (canNext) setMonth((current) => shiftCalendarMonth(current, 1));
  };

  return { days, label: calendarMonthLabel(month), canNext, previous, next };
};
