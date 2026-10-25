/* Expone las operaciones de autenticación de la API. */

import type {
    LoginRequest,
    LoginResponse,
    MeResponse,
} from "../../models/auth/auth";

import { AuthInstance } from "../api/AuthService";

export const login = async (
    loginRequest: LoginRequest
): Promise<LoginResponse> => {
    return AuthInstance.login(loginRequest);
};

export const getMe = async (
    signal?: AbortSignal
): Promise<MeResponse> => {
    return AuthInstance.me(signal);
};