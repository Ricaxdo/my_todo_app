// features/auth/auth-api.ts
import { apiFetch, type ApiError } from "@/lib/api/clients";

export type Me = {
  _id: string;
  name: string;
  lastName?: string;
  phone?: string;
  email: string;
};

export type SigninPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  lastName?: string;
  phone?: string; // puedes mandar "333..." ya normalizado
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
};

function saveToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}

export function isApiError(err: unknown): err is ApiError {
  return typeof err === "object" && err !== null && "status" in err;
}

export function isInvalidCredentials(err: unknown): boolean {
  return isApiError(err) && err.status === 401;
}

export function getAuthErrorMessage(err: unknown): string {
  if (isInvalidCredentials(err)) return "Email o contraseña incorrectos.";
  if (isApiError(err)) return err.message || "Ocurrió un error.";
  return "Ocurrió un error inesperado.";
}

export const authApi = {
  me: () => apiFetch<Me>("/auth/me"),

  signin: async (payload: SigninPayload) => {
    const res = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    saveToken(res.token);
    return res;
  },

  signup: (payload: SignupPayload) =>
    apiFetch<unknown>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () => {
    clearToken();
  },
};
