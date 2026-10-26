/* API DE DESCARGA, SINCRONIZACIÓN Y REVISIÓN */

import type { ApiResponse } from "../../models/common/apiResponse";
import type { OfflineConflict, OfflineOperation, OfflineResult, OfflineSnapshot } from "../../models/common/offline";
import { ApiError, HttpClient } from "../httpClient";
import { apiErrors } from "../../constants/apiErrors";

export class OfflineService extends HttpClient {
  private readonly path = `${this.baseUrl}/offline`;

  private request = async <T>(action: () => Promise<T>): Promise<T> => {
    try {
      return await action();
    } catch (error) {
      const failure = ApiError.from(error);
      if ((failure.status === 404 || failure.status === 405) && failure.titulo === "Solicitud no procesada") {
        throw new ApiError({ tipo: "configuration", status: failure.status, codigo: "OFFLINE_UNAVAILABLE", ...apiErrors.offlineUnavailable });
      }
      throw failure;
    }
  };

  public descargar = (device: string, userId: string, autorizar = false): Promise<ApiResponse<OfflineSnapshot>> => {
    return this.request(() => this.get<ApiResponse<OfflineSnapshot>>(`${this.path}/descarga/${encodeURIComponent(device)}`, { headers: { "X-Offline-Usuario": userId }, params: { autorizar } }));
  };

  public enviar = (request: OfflineOperation, userId: string): Promise<ApiResponse<OfflineResult>> => {
    return this.request(() => this.post<ApiResponse<OfflineResult>>(`${this.path}/operaciones`, request, { headers: { "X-Offline-Usuario": userId } }));
  };

  public liberar = (device: string, userId: string): Promise<ApiResponse<unknown>> => {
    return this.request(() => this.post<ApiResponse<unknown>>(`${this.path}/dispositivos/${encodeURIComponent(device)}/liberar`, undefined, { headers: { "X-Offline-Usuario": userId } }));
  };

  public conflictos = (userId: string): Promise<ApiResponse<OfflineConflict[]>> => {
    return this.request(() => this.get<ApiResponse<OfflineConflict[]>>(`${this.path}/conflictos`, { headers: { "X-Offline-Usuario": userId } }));
  };

  public estados = (userId: string): Promise<ApiResponse<OfflineResult[]>> => {
    return this.request(() => this.get<ApiResponse<OfflineResult[]>>(`${this.path}/operaciones/estados`, { headers: { "X-Offline-Usuario": userId } }));
  };

  public resolver = (id: string, motivo: string, userId: string): Promise<ApiResponse<unknown>> => {
    return this.request(() => this.post<ApiResponse<unknown>>(`${this.path}/conflictos/${encodeURIComponent(id)}/resolver`, { motivo }, { headers: { "X-Offline-Usuario": userId } }));
  };
}

export const OfflineInstance = new OfflineService();
