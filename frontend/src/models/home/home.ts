/* MODELOS DEL INICIO POR ROL */

import type { PaginatedResponse } from "../common/pagination";
import type { ApiResponse } from "../common/apiResponse";
import type { PedidoListadoResponse } from "../pedidos/pedido";
import type { CocinaListadoResponse } from "../cocina/cocina";

export type HomeRole = "ADMINISTRADOR" | "CAJERO" | "COCINA";
export type HomeFilter = "sin-pagar" | "activos" | "listos" | "todos";

export interface InicioResumenResponse {
  rol: HomeRole;
  fecha: string;
  desde: string;
  hasta: string;
  pedidosRealizados: number;
  totalCobrado: number | null;
  pedidosPagados: number | null;
  pendientesPago: number | null;
  pendientesPreparacion: number | null;
  preparando: number | null;
}

export type InicioResponse = ApiResponse<InicioResumenResponse>;

export interface HomeSaleOrder extends PedidoListadoResponse {
  kind: "sale";
}

export interface HomeKitchenOrder extends CocinaListadoResponse {
  kind: "kitchen";
}

export type HomeOrder = HomeSaleOrder | HomeKitchenOrder;

export interface HomeOrdersRequest {
  role: HomeRole;
  filter: HomeFilter;
  page: number;
  desde: string;
  hasta: string;
  recent?: boolean;
}

export type HomeOrdersResponse = PaginatedResponse<HomeOrder>;

export interface KitchenActionRequest {
  id: string;
  action: "iniciar" | "finalizar";
}

export interface KitchenConfirmation extends KitchenActionRequest {
  numero: number;
}

export interface HomeFeedback {
  titulo: string;
  mensaje: string;
  status?: number;
  kind: "error" | "info";
}
