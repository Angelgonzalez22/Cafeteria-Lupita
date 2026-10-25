/* ERRORES DE LA API */

import { isAxiosError, isCancel } from "axios";

import type { ApiErrorDetails, ApiFailureKind } from "../../models/common/apiError";

export class ApiError extends Error {
  public readonly tipo: ApiFailureKind;
  public readonly status?: number;
  public readonly titulo: string;
  public readonly mensaje: string;
  public readonly codigo?: string;
  public readonly sesionInvalida: boolean;

  constructor(details: ApiErrorDetails) {
    super(details.mensaje);
    this.name = "ApiError";
    this.tipo = details.tipo;
    this.status = details.status;
    this.titulo = details.titulo;
    this.mensaje = details.mensaje;
    this.codigo = details.codigo;
    this.sesionInvalida = details.sesionInvalida ?? false;
  }

  public static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (!isAxiosError<unknown>(error)) {
      return new ApiError({
        tipo: "unknown",
        titulo: "Error inesperado",
        mensaje: "No se pudo completar la operación.",
      });
    }

    if (isCancel(error)) {
      return new ApiError({
        tipo: "canceled",
        codigo: error.code,
        titulo: "Operación cancelada",
        mensaje: "La solicitud fue cancelada.",
      });
    }

    if (error.response) {
      const status = error.response.status;
      const payload: unknown = error.response.data;
      const data = typeof payload === "object" && payload !== null ? payload : {};
      let login = false;
      try {
        const url = new URL(error.config?.url ?? "", error.config?.baseURL);
        login = url.pathname.replace(/\/+$/, "").endsWith("/auth/login")
          && error.config?.method?.toLowerCase() === "post";
      } catch {
        login = false;
      }

      const mensajes: Record<number, string> = {
        400: "Verifica los datos enviados.",
        401: "Se requiere una sesión válida.",
        403: "No tienes permisos para realizar esta operación.",
        404: "El recurso solicitado no está disponible.",
        409: "La operación entró en conflicto con los datos actuales.",
        422: "Los datos enviados no son válidos.",
        500: "Ocurrió un error en el servidor.",
      };

      return new ApiError({
        tipo: "http",
        status,
        codigo: error.code,
        titulo: "titulo" in data && typeof data.titulo === "string"
          ? data.titulo : "Solicitud no completada",
        mensaje: "mensaje" in data && typeof data.mensaje === "string"
          ? data.mensaje : mensajes[status] ?? "No se pudo completar la solicitud.",
        sesionInvalida: status === 401 && !login
          && Boolean(error.config?.headers?.get("Authorization")),
      });
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError({
        tipo: "timeout",
        codigo: error.code,
        titulo: "Tiempo agotado",
        mensaje: "El servidor tardó demasiado en responder. Inténtalo nuevamente.",
      });
    }

    return new ApiError({
      tipo: error.request ? "network" : "unknown",
      codigo: error.code,
      titulo: error.request ? "Sin conexión" : "Solicitud no completada",
      mensaje: error.request
        ? "No se pudo conectar con el servidor. Verifica la conexión y la dirección de la API."
        : "No se pudo preparar la solicitud.",
    });
  }
}
