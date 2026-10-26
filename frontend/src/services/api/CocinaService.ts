/* SERVICIO DE PEDIDOS DE COCINA */

import type {
    CocinaPedidosResponse,
    CocinaOperacionResponse,
    CocinaQuery,
} from "../../models/cocina/cocina";
import { HttpClient } from "../httpClient";

export class CocinaService extends HttpClient {
    private readonly path = `${this.baseUrl}/cocina/pedidos`;

    public obtener = (id: string, signal?: AbortSignal): Promise<CocinaOperacionResponse> => {
        return this.get<CocinaOperacionResponse>(`${this.path}/${id}`, { signal });
    };

    public listar = (
        query: CocinaQuery,
        signal?: AbortSignal
    ): Promise<CocinaPedidosResponse> => {
        return this.get<CocinaPedidosResponse>(
            this.path,
            { params: query, signal }
        );
    };

    public iniciar = (id: string): Promise<CocinaOperacionResponse> => {
        return this.patch<CocinaOperacionResponse>(
            `${this.path}/${encodeURIComponent(id)}/iniciar`
        );
    };

    public finalizar = (id: string): Promise<CocinaOperacionResponse> => {
        return this.patch<CocinaOperacionResponse>(
            `${this.path}/${encodeURIComponent(id)}/finalizar`
        );
    };
}

export const CocinaInstance = new CocinaService();
