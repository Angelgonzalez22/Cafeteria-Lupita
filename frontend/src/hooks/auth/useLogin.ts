/* CONTROL DEL FORMULARIO DE ACCESO */

import { useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import type { LoginRequest } from "../../models/auth/auth";
import { loginSchema } from "../../models/auth/validation";
import { iniciarSesion } from "../../services/handler/sessionHandler";
import { ApiError } from "../../services/httpClient";
import { useSessionStore } from "../../store/sessionStore";

export const useLogin = () => {
    const locked = useRef(false);
    const busy = useSessionStore((state) => state.busy);

    const form = useForm<LoginRequest>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        defaultValues: {
            cedula: "",
            contrasena: "",
        },
    });

    const values = useWatch({
        control: form.control,
    });

    const mutation = useMutation({
        mutationFn: iniciarSesion,
        retry: false,
        networkMode: "always",
    });

    const loading = busy || mutation.isPending;
    const canSubmit = loginSchema.safeParse(values).success && !loading;
    const error = mutation.error
        ? ApiError.from(mutation.error)
        : null;

    const submit = async () => {
        if (!canSubmit || locked.current || useSessionStore.getState().busy) {
            return;
        }

        await form.handleSubmit(async (request) => {
            if (locked.current || useSessionStore.getState().busy) {
                return;
            }

            locked.current = true;

            try {
                await mutation.mutateAsync(request);
                form.resetField("contrasena");
            } catch {
                form.setValue("contrasena", "");
            } finally {
                locked.current = false;
            }
        })();
    };

    return {
        form,
        submit,
        loading,
        canSubmit,
        error,
        dismissError: mutation.reset,
    };
};