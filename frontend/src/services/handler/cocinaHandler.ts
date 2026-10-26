/* OPERACIONES DE COCINA */

import type {
    CocinaPedidosResponse,
    CocinaOperacionResponse,
    CocinaQuery,
} from "../../models/cocina/cocina";
import { CocinaInstance } from "../api/CocinaService";

export const getPedidoCocina = async (
    id: string,
    signal?: AbortSignal
): Promise<CocinaOperacionResponse> => {
    return CocinaInstance.obtener(id, signal);
};

export const getPedidosCocina = async (
    query: CocinaQuery,
    signal?: AbortSignal
): Promise<CocinaPedidosResponse> => {
    return CocinaInstance.listar(query, signal);
};

export const iniciarPreparacion = async (
    id: string
): Promise<CocinaOperacionResponse> => {
    return CocinaInstance.iniciar(id);
};

export const finalizarPreparacion = async (
    id: string
): Promise<CocinaOperacionResponse> => {
    return CocinaInstance.finalizar(id);
};
