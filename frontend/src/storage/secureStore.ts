/* ALMACENAMIENTO SEGURO DE SESIÓN */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { Sesion } from "../models/auth/auth";
import { sesionSchema } from "../models/auth/validation";
import { ApiError } from "../services/httpClient/ApiError";

export const auth = {
    session: "lupita.session",
    legacyToken: "lupita.accessToken",
};

const webStorage = new Map<string, string>();

const storageFailure = () => {
    return new ApiError({
        tipo: "storage",
        titulo: "Sesión no disponible",
        mensaje: "No se pudo acceder al almacenamiento seguro. Intenta nuevamente.",
    });
};

const setItem = async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
        webStorage.set(key, value);
        return;
    }

    try {
        await SecureStore.setItemAsync(key, value, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
    } catch {
        throw storageFailure();
    }
};

const getItem = async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
        return webStorage.get(key) ?? null;
    }

    try {
        return await SecureStore.getItemAsync(key);
    } catch {
        throw storageFailure();
    }
};

const removeItem = async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
        webStorage.delete(key);
        return;
    }

    try {
        await SecureStore.deleteItemAsync(key);
    } catch {
        throw storageFailure();
    }
};

export const saveToSecureStorage = async (
    key: string,
    value: string
): Promise<void> => {
    if (!key.trim() || !value.trim()) {
        throw new ApiError({
            tipo: "storage",
            titulo: "Datos incompletos",
            mensaje: "La clave y el valor no pueden estar vacíos.",
        });
    }

    await setItem(key, value);
};

export const getItemFromSecureStorage = async (
    key: string
): Promise<string | null> => {
    return getItem(key);
};

export const deleteFromSecureStorage = async (
    key: string
): Promise<void> => {
    await removeItem(key);
};

export const saveSession = async (session: Sesion): Promise<void> => {
    const value = JSON.stringify(sesionSchema.parse(session));

    await saveToSecureStorage(auth.session, value);
};

export const deleteSession = async (): Promise<void> => {
    await deleteFromSecureStorage(auth.legacyToken);
    await deleteFromSecureStorage(auth.session);
};

export const getSession = async (): Promise<Sesion | null> => {
    const storedSession = await getItemFromSecureStorage(auth.session);

    if (!storedSession) {
        return null;
    }

    let session: unknown;

    try {
        session = JSON.parse(storedSession);
    } catch {
        await deleteSession();
        return null;
    }

    const result = sesionSchema.safeParse(session);

    if (!result.success) {
        await deleteSession();
        return null;
    }

    return result.data;
};

export const getSessionToken = async (): Promise<string | null> => {
    const session = await getSession();

    if (!session || Date.parse(session.expiraEn) <= Date.now()) {
        return null;
    }

    return session.token;
};