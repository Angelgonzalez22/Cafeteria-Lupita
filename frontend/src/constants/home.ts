/* FILTROS COMPARTIDOS DEL INICIO Y PEDIDOS */

import type { FilterOption } from "../models/common/filter";
import type { HomeFilter } from "../models/home/home";

export const homeFilters: readonly FilterOption<HomeFilter>[] = [
  { value: "sin-pagar", label: "Sin pagar" },
  { value: "listos", label: "Listos" },
  { value: "todos", label: "Todos" },
];

export const kitchenFilters: readonly FilterOption<HomeFilter>[] = [
  { value: "activos", label: "Por preparar" },
  { value: "listos", label: "Listos" },
  { value: "todos", label: "Todos" },
];
