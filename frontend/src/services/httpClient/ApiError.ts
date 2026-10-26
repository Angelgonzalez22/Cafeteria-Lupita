/* ERRORES DE LA API */

import { isAxiosError, isCancel } from "axios";
import { apiErrors } from "../../constants/apiErrors";

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

  public static configuration(codigo: string): ApiError {
    return new ApiError({
      tipo: "configuration",
      codigo,
      ...apiErrors.configuration,
    });
  }

  public static invalidResponse(): ApiError {
    return new ApiError({
      tipo: "unknown",
      codigo: "INVALID_RESPONSE",
      ...apiErrors.invalidResponse,
    });
  }

  public static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (typeof error === "object" && error !== null
      && "name" in error && error.name === "ApiError"
      && "titulo" in error && typeof error.titulo === "string"
      && "mensaje" in error && typeof error.mensaje === "string"
      && "tipo" in error && (error.tipo === "http" || error.tipo === "network" || error.tipo === "timeout"
        || error.tipo === "canceled" || error.tipo === "configuration" || error.tipo === "storage" || error.tipo === "unknown")) {
      return new ApiError({
        tipo: error.tipo,
        titulo: error.titulo,
        mensaje: error.mensaje,
        status: "status" in error && typeof error.status === "number" ? error.status : undefined,
        codigo: "codigo" in error && typeof error.codigo === "string" ? error.codigo : undefined,
        sesionInvalida: "sesionInvalida" in error && error.sesionInvalida === true,
      });
    }

    if (!isAxiosError<unknown>(error)) {
      return new ApiError({
        tipo: "unknown",
        ...apiErrors.unknown,
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

      if (status >= 500) {
        return new ApiError({
          tipo: "http",
          status,
          codigo: error.code,
          ...apiErrors.server,
        });
      }

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
      };

      return new ApiError({
        tipo: "http",
        status,
        codigo: error.code,
        titulo: "titulo" in data && typeof data.titulo === "string"
          ? data.titulo : apiErrors.unknown.titulo,
        mensaje: "mensaje" in data && typeof data.mensaje === "string"
          ? data.mensaje : mensajes[status] ?? apiErrors.unknown.mensaje,
        sesionInvalida: status === 401 && !login
          && Boolean(error.config?.headers?.get("Authorization")),
      });
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError({
        tipo: "timeout",
        codigo: error.code,
        ...apiErrors.timeout,
      });
    }

    const networkFailure = error.code === "ERR_NETWORK" || Boolean(error.request);

    return new ApiError({
      tipo: networkFailure ? "network" : "unknown",
      codigo: error.code,
      ...(networkFailure ? apiErrors.network : apiErrors.unknown),
    });
  }
}
