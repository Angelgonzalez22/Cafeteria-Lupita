/* ACCIONES Y MENSAJES DEL DETALLE DEL PEDIDO */

import type { CrearPedidoRequest } from "./pedido";

export type PedidoAction = "cobrar" | "iniciar" | "finalizar";

export interface PedidoFeedback {
  titulo: string;
  mensaje: string;
  status?: number;
}

export type RegistrarVentaRequest = {
  pedido: CrearPedidoRequest;
  cobrar: boolean;
  pagoId: string;
};

