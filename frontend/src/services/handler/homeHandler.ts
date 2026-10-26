/* COORDINACIÓN DEL LISTADO DEL INICIO */

import type {
    HomeKitchenOrder,
    HomeOrdersRequest,
    HomeOrdersResponse,
    HomeSaleOrder,
    KitchenActionRequest,
} from "../../models/home/home";
import type { CocinaOperacionResponse, CocinaPedidosResponse, CocinaQuery } from "../../models/cocina/cocina";
import type { PedidoQuery, PedidosResponse } from "../../models/pedidos/pedido";

import { getPedidos } from "./pedidoHandler";
import {
    finalizarPreparacion,
    getPedidosCocina,
    iniciarPreparacion,
} from "./cocinaHandler";

export const getHomeOrders = async (
    request: HomeOrdersRequest,
    signal?: AbortSignal
): Promise<HomeOrdersResponse> => {
    if (request.role === "COCINA") {
        const query: CocinaQuery = {
            page: request.page,
            pageSize: request.recent ? 5 : 10,
            soloActivos: request.recent || request.filter === "activos",
            estadoPreparacion: !request.recent && request.filter === "listos" ? "LISTO" : undefined,
            desde: request.desde,
            hasta: request.hasta,
            cancelados: false,
            eliminados: false,
        };

        let response: CocinaPedidosResponse = await getPedidosCocina(query, signal);
        let orders = response.data;

        if (request.recent && response.pagination.totalPages > 1) {
            response = await getPedidosCocina({
                ...query,
                page: response.pagination.totalPages,
            }, signal);
            orders = response.data;

            if (orders.length < 5) {
                const previous = await getPedidosCocina({
                    ...query,
                    page: response.pagination.currentPage - 1,
                }, signal);
                orders = [...previous.data, ...orders];
            }
        }

        if (request.recent) {
            orders = [...orders].sort((a, b) => b.numero - a.numero).slice(0, 5);
        }

        const data = orders.map((order): HomeKitchenOrder => ({
            ...order,
            kind: "kitchen",
        }));

        return { ...response, data };
    }

    const query: PedidoQuery = {
        page: request.page,
        pageSize: request.recent ? 5 : 10,
        fechaInicial: request.desde,
        fechaFinal: request.hasta,
        cancelados: false,
        eliminados: false,
        soloMios: request.role === "CAJERO",
        estadoPago: request.filter === "sin-pagar" ? "PENDIENTE" : undefined,
        estadoPreparacion: request.filter === "listos" ? "LISTO" : undefined,
    };

    const response: PedidosResponse = await getPedidos(query, signal);
    const data = response.data.map((order): HomeSaleOrder => ({
        ...order,
        kind: "sale",
    }));

    return { ...response, data };
};

export const cambiarPreparacion = async (
    request: KitchenActionRequest
): Promise<CocinaOperacionResponse> => {
    if (request.action === "iniciar") {
        return iniciarPreparacion(request.id);
    }

    return finalizarPreparacion(request.id);
};
