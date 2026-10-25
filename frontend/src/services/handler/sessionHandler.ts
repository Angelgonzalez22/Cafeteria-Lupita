/* CONTROL DE LA SESIÓN */

import type { LoginRequest, Sesion } from "../../models/auth/auth";
import {
    loginSchema,
    sesionSchema,
    usuarioSchema,
} from "../../models/auth/validation";
import {
    getSession,
    saveSession,
    deleteSession,
} from "../../storage/secureStore";
import { useSessionStore } from "../../store/sessionStore";
import { login, getMe } from "./authHandler";
import { ApiError } from "../httpClient";

let writes: Promise<unknown> = Promise.resolve();
let validation: AbortController | null = null;
let restoring: Promise<void> | null = null;
let requiresRemoval = false;

const serialize = <T>(operation: () => Promise<T>): Promise<T> => {
    const next = writes.then(operation, operation);
    writes = next.catch(() => undefined);

    return next;
};

const state = useSessionStore.getState;
const invalidResponse = () => new ApiError({
    tipo: "unknown",
    titulo: "Respuesta inválida",
    mensaje: "No se pudo recuperar la sesión. Intenta nuevamente."
});
const begin = () => {
    validation?.abort();
    const revision = state().revision + 1;
    useSessionStore.setState({
        revision,
        busy: true,
        error: null
    });

    return revision;
};

const current = (revision: number) => state().revision === revision;
const expired = (session: Sesion) => Date.parse(session.expiraEn) <= Date.now();

export const iniciarSesion = async (request: LoginRequest): Promise<void> => {
    if (state().busy) {
        return;
    }

    const revision = begin();
    try {
        const response = await login(loginSchema.parse(request));
        const parsed = sesionSchema.safeParse(response.data);
        if (response.status < 200 || response.status >= 300 || !parsed.success || expired(parsed.data)) {
            throw invalidResponse();
        }

        const session = {
            ...parsed.data,
            token: parsed.data.token.replace(/^(?:Bearer\s+)+/i, "").trim()
        };
        if (!session.token) {
            throw invalidResponse();
        }

        await serialize(async () => {
            if (!current(revision)) {
                return;
            }

            await saveSession(session);
            if (current(revision)) {
                useSessionStore.setState({
                    session,
                    ready: true
                });
            }
        });
    } catch (error) {
        if (current(revision)) {
            throw ApiError.from(error);
        }
    } finally {
        if (current(revision)) {
            useSessionStore.setState({
                busy: false
            });
        }
    }
};

export const restaurarSesion = (): Promise<void> => {
    if (restoring) {
        return restoring;
    }

    const revision = begin();
    restoring = serialize(async () => {
        try {
            if (requiresRemoval) {
                await deleteSession();
                requiresRemoval = false;
            }

            const session = await getSession();
            if (!current(revision)) {
                return;
            }

            if (session && expired(session)) {
                await deleteSession();
                if (current(revision)) {
                    useSessionStore.setState({
                        session: null,
                        ready: true
                    });
                }
            } else {
                if (!session) {
                    await deleteSession();
                }

                if (current(revision)) {
                    useSessionStore.setState({
                        session,
                        ready: true
                    });
                }
            }
        } catch (error) {
            if (current(revision)) {
                useSessionStore.setState({
                    error: ApiError.from(error),
                    ready: false
                });
            }
        } finally {
            if (current(revision)) {
                useSessionStore.setState({
                    busy: false
                });
            }
        }
    }).then(async () => {
        if (current(revision) && state().session) {
            await validarSesion();
        }
    }).finally(() => {
        restoring = null;
    });

    return restoring;
};

export const validarSesion = async (): Promise<void> => {
    const snapshot = state();
    if (!snapshot.session || snapshot.busy || validation) {
        return;
    }

    if (expired(snapshot.session)) {
        await cerrarSesion(true);

        return;
    }

    const revision = snapshot.revision;
    const controller = new AbortController();
    validation = controller;
    try {
        const response = await getMe(controller.signal);
        const parsed = usuarioSchema.safeParse(response.data);
        if (!parsed.success || response.status !== 200 || parsed.data.id !== snapshot.session.usuario.id) {
            throw invalidResponse();
        }

        await serialize(async () => {
            if (!current(revision) || !state().session) {
                return;
            }

            const session = {
                ...snapshot.session!,
                usuario: parsed.data
            };
            await saveSession(session);
            if (current(revision)) {
                useSessionStore.setState({
                    session
                });
            }
        });
    } catch (error) {
        const failure = ApiError.from(error);
        if (current(revision) && failure.status === 401) {
            await cerrarSesion(true);
        } else if (current(revision) && !["network", "timeout", "canceled"].includes(failure.tipo) && !(failure.status && failure.status >= 500)) {
            useSessionStore.setState({
                error: failure
            });
        }
    } finally {
        if (validation === controller) {
            validation = null;
        }
    }
};

export const cerrarSesion = async (required = false): Promise<void> => {
    if (state().busy) {
        return;
    }

    if (required) {
        requiresRemoval = true;
    }

    const revision = begin();
    await serialize(async () => {
        try {
            await deleteSession();
            requiresRemoval = false;
            if (current(revision)) {
                useSessionStore.setState({
                    session: null,
                    ready: true
                });
            }
        } catch (error) {
            if (current(revision)) {
                useSessionStore.setState({
                    error: ApiError.from(error),
                    session: required ? null : state().session,
                    ready: required ? false : state().ready,
                });
            }
        } finally {
            if (current(revision)) {
                useSessionStore.setState({
                    busy: false
                });
            }
        }
    });
};

export const dismissSessionError = (): void => {
    useSessionStore.setState({
        error: null,
    });
};
