/* MODELOS DE AUTENTICACIÓN */

import type { ApiResponse } from "../common/apiResponse";
import type { ApiErrorDetails } from "../common/apiError";

export interface LoginRequest { cedula: string;
  contrasena: string }

export interface UsuarioResponse { id: string;
  nombre: string;
  apellido: string;
  rol: string }

export interface Sesion { token: string;
  expiraEn: string;
  usuario: UsuarioResponse }

export type LoginResponse = ApiResponse<Sesion>;

export type MeResponse = ApiResponse<UsuarioResponse>;

export interface SessionState {
  session: Sesion | null;
  ready: boolean;
  busy: boolean;
  revision: number;
  error: ApiErrorDetails | null;
}