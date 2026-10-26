/* REGISTRO DEL COBRO COMPLETO EN EFECTIVO */

import type { CobroResponse, CrearPagoRequest } from "../../models/pagos/pago";
import { PagoInstance } from "../api/PagoService";
import { ApiError } from "../httpClient";

export const cobrarPedido = async (request: CrearPagoRequest): Promise<CobroResponse> => {
    const response: CobroResponse = await PagoInstance.crear(request);

    if (!response.data || response.data.id !== request.id || response.data.pedidoId !== request.pedidoId
        || response.data.anulado || response.status < 200 || response.status >= 300) {
        throw ApiError.invalidResponse();
    }

    return response;
};
