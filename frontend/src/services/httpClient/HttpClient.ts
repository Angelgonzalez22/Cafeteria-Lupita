/* PETICIONES HTTP A LA API */

import { create } from "axios";
import type {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

import { getSessionToken } from "../../storage/secureStore";
import { ApiError } from "./ApiError";

const clients = new Map<string, AxiosInstance>();

const resolveBaseUrl = (): string => {
    const value = process.env.EXPO_PUBLIC_API_URL?.trim();

    if (!value) {
        throw ApiError.configuration("API_URL_MISSING");
    }

    try {
        const url = new URL(value);
        const validProtocol = ["http:", "https:"].includes(url.protocol);
        const hasExtraData = url.username || url.password || url.search || url.hash;

        if (!validProtocol || hasExtraData) {
            throw ApiError.configuration("API_URL_INVALID");
        }

        return url.toString().replace(/\/+$/, "");
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw ApiError.configuration("API_URL_INVALID");
    }
};

export abstract class HttpClient {
    protected readonly instance: AxiosInstance;
    protected readonly baseUrl: string;

    constructor() {
        this.baseUrl = resolveBaseUrl();

        const existingClient = clients.get(this.baseUrl);

        if (existingClient) {
            this.instance = existingClient;
            return;
        }

        this.instance = create({
            baseURL: this.baseUrl,
            timeout: 15000,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        this._initializeRequestInterceptor();
        this._initializeResponseInterceptor();

        clients.set(this.baseUrl, this.instance);
    }

    private _initializeRequestInterceptor = () => {
        this.instance.interceptors.request.use(
            this._handleRequest,
            this._handleError
        );
    };

    private _handleRequest = async (
        config: InternalAxiosRequestConfig
    ): Promise<InternalAxiosRequestConfig> => {
        const destination = new URL(this.instance.getUri(config));
        const allowed = new URL(this.baseUrl);
        const sameOrigin = destination.origin === allowed.origin;
        const allowedPath = destination.pathname === allowed.pathname
            || destination.pathname.startsWith(allowed.pathname + "/");

        if (!sameOrigin || !allowedPath) {
            throw ApiError.configuration("API_DESTINATION_INVALID");
        }

        config.headers.delete("Authorization");

        const storedToken = await getSessionToken();
        const token = storedToken
            ?.trim()
            .replace(/^(?:Bearer\s+)+/i, "")
            .trim();

        if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
        }

        return config;
    };

    private _initializeResponseInterceptor = () => {
        this.instance.interceptors.response.use(
            (response) => response,
            this._handleError
        );
    };

    private _handleError = async (error: unknown): Promise<never> => {
        throw ApiError.from(error);
    };

    protected get = async <T>(
        url: string,
        config?: AxiosRequestConfig<unknown>
    ): Promise<T> => {
        const response = await this.instance.get<T, AxiosResponse<T, unknown>, unknown>(
            url,
            config
        );

        return response.data;
    };

    protected post = async <T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig<D>
    ): Promise<T> => {
        const response = await this.instance.post<T, AxiosResponse<T, D>, D>(
            url,
            data,
            config
        );

        return response.data;
    };

    protected put = async <T, D>(
        url: string,
        data: D,
        config?: AxiosRequestConfig<D>
    ): Promise<T> => {
        const response = await this.instance.put<T, AxiosResponse<T, D>, D>(
            url,
            data,
            config
        );

        return response.data;
    };

    protected patch = async <T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig<D>
    ): Promise<T> => {
        const response = await this.instance.patch<T, AxiosResponse<T, D>, D>(
            url,
            data,
            config
        );

        return response.data;
    };

    protected delete = async <T>(
        url: string,
        config?: AxiosRequestConfig<unknown>
    ): Promise<T> => {
        const response = await this.instance.delete<T, AxiosResponse<T, unknown>, unknown>(
            url,
            config
        );

        return response.data;
    };
}
