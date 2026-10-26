/* SERVICIO DE REPORTES */

import type { MasVendidosResponse, ReporteQuery, ResumenResponse } from "../../models/reportes/reporte";
import { HttpClient } from "../httpClient";

export class ReporteService extends HttpClient {
    private readonly path = `${this.baseUrl}/reportes`;

    public resumen = (query: ReporteQuery, signal?: AbortSignal): Promise<ResumenResponse> => {
        return this.get<ResumenResponse>(`${this.path}/resumen`, { params: query, signal });
    };

    public masVendidos = (query: ReporteQuery, signal?: AbortSignal): Promise<MasVendidosResponse> => {
        return this.get<MasVendidosResponse>(`${this.path}/productos-mas-vendidos`, {
            params: { ...query, top: 10 },
            signal,
        });
    };
}

export const ReporteInstance = new ReporteService();
