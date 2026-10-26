/* FORMATOS DE MONEDA Y HORA */

import { formatTime12h } from "./date";

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (value: number): string => {
  return (value < 0 ? "-$" : "$") + amountFormatter.format(Math.abs(value));
};

export const formatOrderTime = (value: string): string => {
  return formatTime12h(value);
};
