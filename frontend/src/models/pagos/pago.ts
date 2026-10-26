/* CONTRATOS DEL COBRO DE PEDIDOS */

import type { ApiResponse } from "../common/apiResponse";

export interface CrearPagoRequest {
  id: string;
  pedidoId: string;
  confirmarPedidoAjeno?: boolean;
  totalEsperado?: number;
  versionPedido?: string;
}

export interface PagoResponse {
  id: string;
  pedidoId: string;
  numeroPedido: number;
  monto: number;
  metodoPago: string;
  creadoEn: string;
  creadoPor: string;
  cobradoPor: string;
  anulado: boolean;
  anuladoEn: string | null;
  anuladoPor: string | null;
  motivoAnulacion: string | null;
}

export type CobroResponse = ApiResponse<PagoResponse>;
