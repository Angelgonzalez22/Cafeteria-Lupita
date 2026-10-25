/* MODELO DE ERRORES */

export type ApiFailureKind =
  | "http"
  | "network"
  | "timeout"
  | "canceled"
  | "configuration"
  | "storage"
  | "unknown";

export interface ApiErrorDetails {
  tipo: ApiFailureKind;
  status?: number;
  titulo: string;
  mensaje: string;
  codigo?: string;
  sesionInvalida?: boolean;
}
