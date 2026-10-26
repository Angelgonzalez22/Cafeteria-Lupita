/* PEDIDOS CONFIRMADOS PARA EL AVISO DE SINCRONIZACIÓN */

import type { OutboxRow } from "../models/common/offline";

export const confirmedOfflineOrders = (
  operationIds: readonly string[],
  operations: readonly Pick<OutboxRow, "id" | "pedidoId" | "estado">[],
): string[] | null => {
  const rows = new Map(operations.map((operation) => [operation.id, operation]));
  const orders = new Set<string>();

  for (const id of operationIds) {
    const operation = rows.get(id);
    if (!operation || operation.estado === "pendiente" || operation.estado === "conflicto") return null;
    if (operation.estado === "sincronizado") orders.add(operation.pedidoId);
  }

  return [...orders];
};
