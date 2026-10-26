/* IDENTIFICACIÓN VISIBLE DE PEDIDOS LOCALES Y REGISTRADOS */

export const orderLabel = (order: { numero: number; provisional?: string; id: string }): string => {
  return order.numero > 0 ? `Pedido #${order.numero}` : `Pedido local ${order.provisional ?? order.id.slice(0, 8).toUpperCase()}`;
};
