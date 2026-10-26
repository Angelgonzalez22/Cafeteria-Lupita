/* CONSULTAS DE REPORTES */

import type { MasVendidosResponse, ReporteQuery, ResumenResponse } from "../../models/reportes/reporte";
import { ReporteInstance } from "../api/ReporteService";

export const getReporteResumen = async (
    query: ReporteQuery,
    signal?: AbortSignal
): Promise<ResumenResponse> => {
    return ReporteInstance.resumen(query, signal);
};

export const getProductosMasVendidos = async (
    query: ReporteQuery,
    signal?: AbortSignal
): Promise<MasVendidosResponse> => {
    return ReporteInstance.masVendidos(query, signal);
};
