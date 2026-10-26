/* MODELOS OPERATIVOS DE COCINA */

import type { PaginatedResponse, PaginationQuery } from "../common/pagination";
import type { ApiResponse } from "../common/apiResponse";
import type { EstadoPreparacion } from "../pedidos/pedido";

export interface CocinaProductoResponse {
  productoId: string;
  producto: string;
  cantidad: number;
}

export interface CocinaListadoResponse {
  id: string;
  numero: number;
  cliente: string;
  estadoPreparacion: EstadoPreparacion;
  creadoEn: string;
  cancelado: boolean;
  eliminado: boolean;
  detalles: CocinaProductoResponse[];
}

export interface CocinaPedidoResponse extends CocinaListadoResponse {
  atendidoPor: string;
}

export interface CocinaQuery extends PaginationQuery {
  soloActivos?: boolean;
  estadoPreparacion?: EstadoPreparacion;
  desde?: string;
  hasta?: string;
  cancelados?: boolean;
  eliminados?: boolean;
}

export type CocinaPedidosResponse = PaginatedResponse<CocinaListadoResponse>;
export type CocinaOperacionResponse = ApiResponse<CocinaPedidoResponse>;
