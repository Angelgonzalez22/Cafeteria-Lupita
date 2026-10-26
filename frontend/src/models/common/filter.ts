/* OPCIONES REUTILIZABLES PARA FILTROS */

export interface FilterOption<T extends string> {
  readonly value: T;
  readonly label: string;
}
