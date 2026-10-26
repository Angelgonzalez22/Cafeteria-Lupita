/* SERVICIO DE PRODUCTOS */

import type { ProductoQuery, ProductosResponse } from "../../models/productos/producto";
import { HttpClient } from "../httpClient";

export class ProductoService extends HttpClient {
    private readonly path = `${this.baseUrl}/productos`;

    public listar = (
        query: ProductoQuery,
        signal?: AbortSignal
    ): Promise<ProductosResponse> => {
        return this.get<ProductosResponse>(this.path, { params: query, signal });
    };
}

export const ProductoInstance = new ProductoService();
