// features/api/auth.ts
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
  phone?: string;
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

export function isInvalidCredentials(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as ApiError).status === 401
  );
}

export const authApi = {
  // ✅ devuelve Me (no {user: Me})
  me: async () => {
    const res = await apiFetch<{ user: Me }>("/auth/me");
    return res.user;
  },

  signin: async (payload: SigninPayload) => {
    const res = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    saveToken(res.token);
    return res;
  },

  signup: async (payload: SignupPayload) => {
    return apiFetch<{ id: string; name: string; email: string }>(
      "/auth/signup",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  logout: () => {
    clearToken();
  },
};
