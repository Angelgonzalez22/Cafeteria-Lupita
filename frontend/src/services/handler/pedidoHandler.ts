/* CONSULTA DE PEDIDOS */

import type { CrearPedidoRequest, PedidoDetalleResponse, PedidoQuery, PedidosResponse } from "../../models/pedidos/pedido";
import { crearPedidoSchema } from "../../models/pedidos/validation";
import { PedidoInstance } from "../api/PedidoService";
import { ApiError } from "../httpClient";
import { cacheDownloadedPedido, localPedido, localPedidos, supportsOffline } from "./offlineHandler";
import { useOfflineStore } from "../../store/offlineStore";
import { getBusinessToday } from "../../utils/date";

export const getPedidos = async (
    query: PedidoQuery,
    signal?: AbortSignal
): Promise<PedidosResponse> => {
    if (supportsOffline) {
        const currentDay = query.fechaInicial?.slice(0, 10);
        if (!currentDay || currentDay === getBusinessToday() || !useOfflineStore.getState().connected) {
            const local = await localPedidos(query);
            if (local) return local;
        }
    }
    return PedidoInstance.listar(query, signal);
};

export const crearPedido = async (
    request: CrearPedidoRequest
): Promise<PedidoDetalleResponse> => {
    const response: PedidoDetalleResponse = await PedidoInstance.crear(crearPedidoSchema.parse(request));

    if (response.status < 200 || response.status >= 300 || response.data?.id !== request.id) {
        throw ApiError.invalidResponse();
    }

    return response;
};

export const getPedido = async (
    id: string,
    signal?: AbortSignal
): Promise<PedidoDetalleResponse> => {
    const local = await localPedido(id);
    if (local) return { status: 200, titulo: "Pedido", mensaje: "Pedido guardado en este dispositivo.", data: local };
    const response = await PedidoInstance.obtener(id, signal);
    if (response.data) await cacheDownloadedPedido(response.data);
    return response;
};
