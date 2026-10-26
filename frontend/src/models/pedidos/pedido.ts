/* MODELOS DEL LISTADO DE PEDIDOS */

import type { PaginatedResponse, PaginationQuery } from "../common/pagination";
import type { ApiResponse } from "../common/apiResponse";
import type { CocinaPedidoResponse } from "../cocina/cocina";

export type EstadoPreparacion = "PENDIENTE" | "PREPARANDO" | "LISTO";
export type EstadoPago = "PENDIENTE" | "PAGADO";

export interface PedidoListadoResponse {
  syncStatus?: import("../common/offline").SyncStatus;
  provisional?: string;
  id: string;
  numero: number;
  cliente: string;
  atendidoPor: string;
  total: number;
  estadoPreparacion: EstadoPreparacion;
  estadoPago: EstadoPago;
  creadoEn: string;
  cancelado: boolean;
  eliminado: boolean;
}

export interface PedidoQuery extends PaginationQuery {
  fechaInicial?: string;
  fechaFinal?: string;
  estadoPreparacion?: EstadoPreparacion;
  estadoPago?: EstadoPago;
  cancelados?: boolean;
  eliminados?: boolean;
  soloMios?: boolean;
}

export type PedidosResponse = PaginatedResponse<PedidoListadoResponse>;

export interface CrearPedidoRequest {
  id: string;
  referencia: string;
  nombreCliente?: string;
  detalles: { productoId: string; cantidad: number }[];
}

export interface DetallePedidoResponse {
  productoId: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoResponse {
  version?: string;
  creadoPor?: string;
  syncStatus?: import("../common/offline").SyncStatus;
  syncMessage?: string;
  provisional?: string;
  id: string;
  numero: number;
  referencia: string;
  nombreCliente: string | null;
  cliente: string;
  atendidoPor: string;
  estadoPreparacion: EstadoPreparacion;
  estadoPago: EstadoPago;
  detalles: DetallePedidoResponse[];
  total: number;
  creadoEn: string;
  canceladoEn: string | null;
  motivoCancelacion: string | null;
}

export type PedidoDetalleResponse = ApiResponse<PedidoResponse>;

export type PedidoVista =
  | { kind: "sale"; pedido: PedidoResponse }
  | { kind: "kitchen"; pedido: CocinaPedidoResponse };
