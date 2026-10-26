/* VALIDACIÓN DE NUEVA VENTA */

import { z } from "zod";

export const nuevaVentaSchema = z.object({
  referencia: z.string().trim().min(1, "Escribe una referencia.").max(30, "Máximo 30 caracteres."),
  nombreCliente: z.string().trim().max(100, "Máximo 100 caracteres."),
});

export type NuevaVentaForm = z.infer<typeof nuevaVentaSchema>;

export const crearPedidoSchema = nuevaVentaSchema.extend({
  id: z.uuid(),
  nombreCliente: z.string().trim().max(100).optional(),
  detalles: z.array(z.object({
    productoId: z.guid(),
    cantidad: z.number().int().min(1).max(2147483647),
  })).min(1).max(100),
});
