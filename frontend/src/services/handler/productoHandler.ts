/* CONSULTA DE PRODUCTOS */

import type { ProductoQuery, ProductosResponse } from "../../models/productos/producto";
import { ProductoInstance } from "../api/ProductoService";
import { localProductos, prepareOfflineData } from "./offlineHandler";
import { useOfflineStore } from "../../store/offlineStore";

export const getProductos = async (
    query: ProductoQuery,
    signal?: AbortSignal
): Promise<ProductosResponse> => {
    if (query.activo === true) await prepareOfflineData();
    const state = useOfflineStore.getState();
    const local = !state.connected || (query.activo === true && state.authorized && !state.released) ? await localProductos(query) : null;
    return local ?? ProductoInstance.listar(query, signal);
};
