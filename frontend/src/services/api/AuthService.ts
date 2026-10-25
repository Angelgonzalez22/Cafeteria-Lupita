/* SERVICIO DE AUTENTICACIÓN */

import type {
    LoginRequest,
    LoginResponse,
    MeResponse,
} from "../../models/auth/auth";

import { HttpClient } from "../httpClient";

export class AuthService extends HttpClient {
    private readonly path = `${this.baseUrl}/auth`;

    public login = (loginRequest: LoginRequest): Promise<LoginResponse> => {
        return this.post<LoginResponse, LoginRequest>(
            `${this.path}/login`,
            loginRequest
        );
    };

    public me = (signal?: AbortSignal): Promise<MeResponse> => {
        return this.get<MeResponse>(
            `${this.path}/me`,
            { signal }
        );
    };
}

export const AuthInstance = new AuthService();