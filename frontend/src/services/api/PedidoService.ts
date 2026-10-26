/* SERVICIO DEL LISTADO DE PEDIDOS */

import type { CrearPedidoRequest, PedidoDetalleResponse, PedidoQuery, PedidosResponse } from "../../models/pedidos/pedido";
import { HttpClient } from "../httpClient";

export class PedidoService extends HttpClient {
    private readonly path = `${this.baseUrl}/pedidos`;

    public crear = (request: CrearPedidoRequest): Promise<PedidoDetalleResponse> => {
        return this.post<PedidoDetalleResponse, CrearPedidoRequest>(this.path, request);
    };

    public obtener = (id: string, signal?: AbortSignal): Promise<PedidoDetalleResponse> => {
        return this.get<PedidoDetalleResponse>(`${this.path}/${id}`, { signal });
    };

    public listar = (
        query: PedidoQuery,
        signal?: AbortSignal
    ): Promise<PedidosResponse> => {
        return this.get<PedidosResponse>(
            this.path,
            { params: query, signal }
        );
    };
}

export const PedidoInstance = new PedidoService();
