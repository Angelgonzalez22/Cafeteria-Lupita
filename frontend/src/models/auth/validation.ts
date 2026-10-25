/* Valida los datos de autenticación y la sesión guardada. */

import { z } from "zod";

export const loginSchema = z.object({
  cedula: z.string().trim().min(1, "Ingresa tu cédula.").max(25, "Máximo 25 caracteres."),
  contrasena: z.string()
    .min(1, "Ingresa tu contraseña.")
    .max(1024, "Máximo 1024 caracteres.")
    .refine((value) => value.trim().length > 0, "Ingresa tu contraseña."),
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
