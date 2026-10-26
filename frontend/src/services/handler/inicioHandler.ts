/* CONSULTA DEL RESUMEN DE INICIO */

import type { InicioResponse } from "../../models/home/home";
import { InicioInstance } from "../api/InicioService";
import { ApiError } from "../httpClient";
import { localResumen } from "./offlineHandler";
import { useSessionStore } from "../../store/sessionStore";

export const getInicioResumen = async (
    signal?: AbortSignal
): Promise<InicioResponse> => {
    if (useSessionStore.getState().session?.usuario.rol !== "COCINA") {
        const local = await localResumen();
        if (local) return local;
    }
    const response: InicioResponse = await InicioInstance.resumen(signal);

    if (!response.data) {
        throw ApiError.invalidResponse();
    }

    return response;
};
