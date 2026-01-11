"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ActivityItem,
  ActivityListResponse,
} from "../types/activity.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ErrorResponse {
  message?: string;
  error?: string;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useWorkspaceActivity(params: {
  workspaceId: string | null;
  enabled?: boolean; // 👈 solo carga cuando el tab está activo y el modal abierto
}) {
  const { workspaceId, enabled = true } = params;

  const [items, setItems] = useState<ActivityItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = useMemo(() => {
    if (!workspaceId) return null;
    return `${API_URL}/workspaces/${workspaceId}/activity`;
  }, [workspaceId]);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token || !baseUrl || !enabled) {
      setItems([]);
      setNextCursor(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams();
      qs.set("limit", "30");

      const res = await fetch(`${baseUrl}?${qs.toString()}`, {
        headers: { ...authHeaders() },
      });

      const data = (await res
        .json()
        .catch(() => null)) as ActivityListResponse | null;

      if (!res.ok) {
        setError(
          (data as ErrorResponse)?.message ||
            (data as ErrorResponse)?.error ||
            `GET activity failed (${res.status})`
        );
        return;
      }

      if (!data || !Array.isArray(data.items)) {
        setError("Respuesta inválida de activity");
        return;
      }

      setItems(data.items);
      setNextCursor(data.nextCursor ?? null);
    } catch {
      setError("Network error loading activity");
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, enabled]);

  const loadMore = useCallback(async () => {
    const token = getToken();
    if (!token || !baseUrl || !enabled) return;
    if (!nextCursor) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const qs = new URLSearchParams();
      qs.set("limit", "30");
      qs.set("before", nextCursor);

      const res = await fetch(`${baseUrl}?${qs.toString()}`, {
        headers: { ...authHeaders() },
      });

      const data = (await res
        .json()
        .catch(() => null)) as ActivityListResponse | null;

      if (!res.ok) {
        setError(
          (data as ErrorResponse)?.message ||
            (data as ErrorResponse)?.error ||
            `GET activity failed (${res.status})`
        );
        return;
      }

      if (!data || !Array.isArray(data.items)) {
        setError("Respuesta inválida de activity");
        return;
      }

      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor ?? null);
    } catch {
      setError("Network error loading more activity");
    } finally {
      setIsLoadingMore(false);
    }
  }, [baseUrl, enabled, nextCursor]);

  // ✅ recargar cuando:
  // - abres modal y tab activity está activo
  // - cambias de workspace
  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    nextCursor,
    isLoading,
    isLoadingMore,
    error,
    reload: load,
    loadMore,
    hasMore: Boolean(nextCursor),
  };
}
