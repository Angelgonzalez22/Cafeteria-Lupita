/* Contrato común de respuestas del backend. */
export interface ApiResponse<T> {
  status: number;
  titulo: string;
  mensaje: string;
  data: T | null;
}

export type EmptyResponse = ApiResponse<null>;
