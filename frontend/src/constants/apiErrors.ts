/* MENSAJES GENERALES DE ERRORES */

import type { ApiErrorMessage } from "../models/common/apiError";

export const apiErrors = {
  offlineUnavailable: {
    titulo: "Sincronización no disponible",
    mensaje: "La sincronización todavía no está disponible en el servidor. Puedes seguir usando la aplicación con conexión. Contacta a soporte para habilitarla.",
  },
  server: {
    titulo: "Error del servidor",
    mensaje: "Ocurrió un problema en el servidor. Inténtalo de nuevo. Si el problema continúa, contacta a soporte técnico.",
  },
  network: {
    titulo: "Servidor no disponible",
    mensaje: "No se pudo conectar con el servidor. Inténtalo de nuevo. Si el problema continúa, contacta a soporte técnico.",
  },
  timeout: {
    titulo: "Tiempo de espera agotado",
    mensaje: "El servidor tardó demasiado en responder. Inténtalo de nuevo. Si el problema continúa, contacta a soporte técnico.",
  },
  configuration: {
    titulo: "Conexión no disponible",
    mensaje: "No se pudo configurar la conexión con el servidor. Contacta a soporte técnico.",
  },
  invalidResponse: {
    titulo: "Respuesta no disponible",
    mensaje: "El servidor no devolvió una respuesta válida. Inténtalo de nuevo. Si el problema continúa, contacta a soporte técnico.",
  },
  unknown: {
    titulo: "No se pudo completar la operación",
    mensaje: "Ocurrió un problema inesperado. Inténtalo de nuevo. Si el problema continúa, contacta a soporte técnico.",
  },
} satisfies Record<string, ApiErrorMessage>;
