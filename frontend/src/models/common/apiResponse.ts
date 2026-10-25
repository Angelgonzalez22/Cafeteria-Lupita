/* RESPUESTA DE LA API */

export interface ApiResponse<T> {
  status: number;
  titulo: string;
  mensaje: string;
  data: T | null;
}

export type EmptyResponse = ApiResponse<null>;
