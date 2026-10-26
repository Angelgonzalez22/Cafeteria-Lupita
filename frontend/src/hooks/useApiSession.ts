/* VALIDACIÓN DE SESIÓN ANTE ERRORES DE API */

import { useEffect } from "react";
import { validarSesion } from "../services/handler/sessionHandler";
import { ApiError } from "../services/httpClient";

export const useApiSession = (error: unknown) => {
  useEffect(() => {
    if (error instanceof ApiError && error.sesionInvalida) {
      void validarSesion();
    }
  }, [error]);
};
