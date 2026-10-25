/* VALIDACIÓN DE ACCESO */

import { z } from "zod";

export const loginSchema = z.object({
  cedula: z.string().trim().min(1, "Ingresa tu cédula.").max(25, "Máximo 25 caracteres."),
  contrasena: z.string()
    .regex(/^\d{6}$/, "Ingresa un PIN de 6 números."),
});

export const usuarioSchema = z.object({
  id: z.guid(),
  nombre: z.string(),
  apellido: z.string(),
  rol: z.string().min(1),
});

export const sesionSchema = z.object({
  token: z.string().trim().min(1),
  expiraEn: z.iso.datetime({
    offset: true
  }),
  usuario: usuarioSchema,
});
