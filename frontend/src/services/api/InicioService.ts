/* SERVICIO DEL RESUMEN DEL INICIO */

import type { InicioResponse } from "../../models/home/home";
import { HttpClient } from "../httpClient";

export class InicioService extends HttpClient {
    private readonly path = `${this.baseUrl}/inicio`;

    public resumen = (signal?: AbortSignal): Promise<InicioResponse> => {
        return this.get<InicioResponse>(
            `${this.path}/resumen`,
            { signal }
        );
    };
}

export const InicioInstance = new InicioService();