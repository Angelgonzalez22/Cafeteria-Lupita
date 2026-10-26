/* SERVICIO DE COBROS */

import type { CobroResponse, CrearPagoRequest } from "../../models/pagos/pago";
import { HttpClient } from "../httpClient";

export class PagoService extends HttpClient {
    private readonly path = `${this.baseUrl}/pagos`;

    public crear = (request: CrearPagoRequest): Promise<CobroResponse> => {
        return this.post<CobroResponse, CrearPagoRequest>(this.path, request);
    };
}

export const PagoInstance = new PagoService();
