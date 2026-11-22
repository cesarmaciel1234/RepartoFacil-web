"use client";

import { useEffect, useState } from "react";
import { authHeaders } from "@/lib/clientAuth";

export function useMensajesNoLeidos() {
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let sequence = 0;
    const refresh = async () => {
      const request = ++sequence;
      const headers = authHeaders("Client");
      if (!headers.Authorization) {
        setUnread({});
        setError(false);
        return;
      }
      try {
        const response = await fetch("/api/chat/unread", { headers, cache: "no-store" });
        if (!response.ok) throw new Error(`El servidor respondió ${response.status}`);
        const data: unknown = await response.json();
        if (!data || typeof data !== "object" || !Array.isArray((data as { conversations?: unknown }).conversations)) {
          throw new Error("Respuesta de mensajes nuevos inválida.");
        }
        const entries = (data as { conversations: unknown[] }).conversations;
        const counts: Record<string, number> = {};
        for (const entry of entries) {
          if (!entry || typeof entry !== "object") throw new Error("Contador de mensajes inválido.");
          const row = entry as { order_id?: unknown; unread?: unknown };
          if (typeof row.order_id !== "string" || typeof row.unread !== "number" ||
              !Number.isSafeInteger(row.unread) || row.unread < 0) {
            throw new Error("Contador de mensajes inválido.");
          }
          counts[row.order_id] = row.unread;
        }
        if (active && request === sequence && authHeaders("Client").Authorization === headers.Authorization) {
          setUnread(counts);
          setError(false);
        }
      } catch (cause) {
        if (active && request === sequence) {
          console.warn("No se pudieron actualizar los mensajes nuevos:", cause);
          setUnread({});
          setError(true);
        }
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 5000);
    window.addEventListener("rf-chat-read", refresh);
    const refreshIdentity = () => {
      setUnread({});
      setError(false);
      void refresh();
    };
    window.addEventListener("repartofacil-client-auth", refreshIdentity);
    window.addEventListener("repartofacil-auth", refreshIdentity);
    window.addEventListener("storage", refreshIdentity);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("rf-chat-read", refresh);
      window.removeEventListener("repartofacil-client-auth", refreshIdentity);
      window.removeEventListener("repartofacil-auth", refreshIdentity);
      window.removeEventListener("storage", refreshIdentity);
    };
  }, []);

  return { unread, unreadError: error, unreadTotal: Object.values(unread).reduce((sum, count) => sum + count, 0) };
}
