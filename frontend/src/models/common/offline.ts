/* CONTRATOS DE ALMACENAMIENTO Y SINCRONIZACIÓN OFFLINE */

import type { PedidoResponse } from "../pedidos/pedido";
import type { ProductoResponse } from "../productos/producto";

export type SyncStatus = "pendiente" | "sincronizado" | "conflicto" | "revisado";

export interface OfflineSyncNotice {
  id: string;
  pedidoIds: string[];
}

export interface OfflineOrder {
  pedido: PedidoResponse;
  creadoPor: string;
  pagadoEn: string | null;
  pagadoPor: string | null;
}

export interface OfflineSnapshot {
  catalogoId: string;
  actualizadoEn: string;
  productos: ProductoResponse[];
  pedidos: OfflineOrder[];
}

export interface OfflineOperation {
  id: string;
  dispositivoId: string;
  pedidoId: string;
  ocurridoEn: string;
  crear: {
    catalogoId: string;
    referencia: string;
    nombreCliente?: string;
    detalles: { productoId: string; cantidad: number; precioUnitario: number }[];
  } | null;
  pagoId: string | null;
  listo: boolean;
  totalEsperado: number;
  version?: string;
  listoEn?: string;
}

export interface OfflineResult {
  id: string;
  estado: SyncStatus;
  mensaje: string;
  pedido: PedidoResponse | null;
}

export interface StoredOrder extends OfflineOrder {
  estado: SyncStatus;
  mensaje?: string;
}

export interface OutboxRow {
  id: string;
  pedidoId: string;
  contenido: string;
  estado: SyncStatus;
  intentado: number;
  mensaje: string;
}

export interface OfflineConflict {
  id: string;
  usuarioId: string;
  dispositivoId: string;
  contenido: string;
  resultado: string;
  registradoEn: string;
}
