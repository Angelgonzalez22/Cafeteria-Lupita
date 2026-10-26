/* CONTRATOS DE REPORTES DE ADMINISTRACIÓN */

import type { ApiResponse } from "../common/apiResponse";

export interface ReporteQuery {
  desde?: string;
  hasta?: string;
}

export interface ResumenReporteResponse {
  desde: string;
  hasta: string;
  totalCobrado: number;
  pedidosCreados: number;
  pedidosPendientesPago: number;
  pedidosPagados: number;
  pedidosCancelados: number;
  utilidadBrutaEstimada: number;
}

export interface ProductoVendidoResponse {
  productoId: string;
  nombre: string;
  cantidadVendida: number;
  totalVentas: number;
  costoEstimado: number;
  utilidadBrutaEstimada: number;
}

export interface ProductosVendidosResponse {
  desde: string;
  hasta: string;
  productos: ProductoVendidoResponse[];
}

export type ResumenResponse = ApiResponse<ResumenReporteResponse>;
export type MasVendidosResponse = ApiResponse<ProductosVendidosResponse>;
