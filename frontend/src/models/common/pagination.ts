/* Parámetros y metadatos de los listados paginados. */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  status: number;
  titulo: string;
  mensaje: string;
  data: T[];
  pagination: PaginationMetadata;
}
