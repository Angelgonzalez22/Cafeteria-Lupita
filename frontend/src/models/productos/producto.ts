/* CONTRATOS DE PRODUCTOS */

import type { PaginatedResponse, PaginationQuery } from "../common/pagination";

export interface ResponsableResponse {
  id: string;
  nombre: string;
}

export interface ProductoResponse {
  catalogoId?: string;
  id: string;
  nombre: string;
  imagenUrl: string | null;
  precio: number;
  costo?: number | null;
  descripcion?: string | null;
  activo?: boolean | null;
  eliminado?: boolean | null;
  creadoEn?: string | null;
  creadoPor?: ResponsableResponse | null;
  actualizadoEn?: string | null;
  actualizadoPor?: ResponsableResponse | null;
  eliminadoEn?: string | null;
  eliminadoPor?: ResponsableResponse | null;
}

export interface ProductoQuery extends PaginationQuery {
  nombre?: string;
  activo?: boolean;
  eliminados?: boolean;
}

export interface VentaLinea {
  producto: ProductoResponse;
  cantidad: number;
}

export type ProductosResponse = PaginatedResponse<ProductoResponse>;
