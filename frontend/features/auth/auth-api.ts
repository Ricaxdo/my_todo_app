// lib/api/auth.ts
import { apiFetch } from "@/lib/api/clients";

export type Me = {
  id: string;
  name: string;
  email: string;
};

export type SigninPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  lastName?: string; // si lo vas a mandar también
  phone?: string; // si lo vas a mandar también
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

export const authApi = {
  me: () => apiFetch<Me>("/users/me"),

  signin: async (payload: SigninPayload) => {
    const res = await apiFetch<AuthResponse>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    saveToken(res.token);
    return res;
  },

  signup: async (payload: SignupPayload) => {
    // Si tu backend devuelve token al registrarse:
    // const res = await apiFetch<AuthResponse>("/auth/signup", {...})
    // saveToken(res.token); return res;

    // Si tu backend NO devuelve token (solo crea usuario):
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
