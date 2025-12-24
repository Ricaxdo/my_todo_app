// features/auth/auth-api.ts
import { apiFetch, type ApiError } from "@/lib/api/clients";

export type Me = {
  _id: string;
  name: string;
  lastName?: string;
  phone?: string;
  email: string;
};

export type MeResponse = {
  user: Me;
};

export type SigninPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  lastName?: string;
  phone?: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
};

export type SignupResponse = {
  token: string;
  personalWorkspaceId: string | null;
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
  // ✅ backend devuelve { user: {...} }
  me: async () => {
    const data = await apiFetch<MeResponse>("/auth/me");
    return data.user;
  },

  signin: async (payload: SigninPayload) => {
    const res = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    saveToken(res.token);
    return res;
  },

  // ✅ backend devuelve { token, personalWorkspaceId }
  signup: async (payload: SignupPayload) => {
    const res = await apiFetch<SignupResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    saveToken(res.token); // 👈 CLAVE
    return res;
  },

  logout: () => {
    clearToken();
  },
};
