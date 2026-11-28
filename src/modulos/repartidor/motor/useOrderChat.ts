"use client";

import { useState, useEffect, useRef } from "react";
import { loadClientProfile, loadDriverProfile } from "./driverService";
import { authHeaders } from "@/lib/clientAuth";

export type ChatAuthorRole = "driver" | "client" | "company";

export interface OrderChatMessage {
  id: string;
  orderId: string;
  authorRole: ChatAuthorRole;
  authorName: string;
  content: string;
  timestamp: string;
  createdAt?: string;
  isRead?: boolean;
}

export interface UseOrderChatOptions {
  isOpen: boolean;
  orderId: string;
  effectiveRole: "client" | "driver";
  driverName?: string;
  clientName?: string;
  activeOrder?: any;
  onOpenChange: (open: boolean) => void;
}

export function useOrderChat({
  isOpen,
  orderId,
  effectiveRole,
  driverName = "Lucas Motomensajero",
  clientName,
  activeOrder,
  onOpenChange,
}: UseOrderChatOptions) {
  const isDriverViewer = effectiveRole === "driver";
  const clientId = !isDriverViewer ? loadClientProfile()?.userId : undefined;
  const storageKey = `rf_client_chat_v2:${encodeURIComponent(clientId || "")}:${encodeURIComponent(orderId)}`;

  const [messages, setMessages] = useState<OrderChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);
  const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState(false);
  const isInitialLoadRef = useRef(true);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const chatContext = useRef({ isOpen, orderId, isDriverViewer });
  chatContext.current = { isOpen, orderId, isDriverViewer };

  // Al abrir el chat, despachar de inmediato la lectura para borrar el contador
  useEffect(() => {
    if (isOpen && orderId) {
      window.dispatchEvent(new CustomEvent("rf-chat-read", { detail: { orderId } }));
    }
  }, [isOpen, orderId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNear = distanceToBottom < 75;
    isNearBottomRef.current = isNear;
    if (isNear) {
      setHasNewMessagesBelow(false);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
      isNearBottomRef.current = true;
      setHasNewMessagesBelow(false);
    }
  };

  // Cargar mensajes persistentes y sincronizar con backend PostgreSQL
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    let fetching = false;
    const controller = new AbortController();
    const role = isDriverViewer ? "Driver" : "Client";
    const authorization = authHeaders(role).Authorization;
    setMessages([]);
    setInputText("");
    setLoadError(null);
    setSendError(null);

    // 1. Cargar caché local primero
    try {
      const canReadCache = !isDriverViewer && clientId && authHeaders("Client").Authorization;
      const raw = canReadCache ? localStorage.getItem(storageKey) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (error) {
      console.warn("No se pudo leer el historial del chat:", error);
    }

    // 2. Sincronizar con API cloud /api/chat/[orderId]
    const fetchCloudMessages = async () => {
      if (fetching) return;
      fetching = true;
      try {
        const markRead = document.visibilityState === "visible";
        const res = await fetch(`/api/chat/${encodeURIComponent(orderId)}${markRead ? "?read=1" : ""}`, {
          cache: "no-store",
          headers: authorization ? { Authorization: authorization } : {},
          signal: controller.signal,
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403 || res.status === 404) {
            if (active) setMessages([]);
            throw new Error("La conversación no está disponible para esta sesión.");
          }
          throw new Error("No se pudo actualizar el chat. Los mensajes guardados pueden estar desactualizados.");
        }
        const data = await res.json();
        if (!data.success || !Array.isArray(data.messages)) throw new Error("La respuesta del chat no es válida.");
        if (active && authHeaders(role).Authorization === authorization) {
          setMessages(data.messages);
          setLoadError(null);
          try {
            if (!isDriverViewer && clientId) localStorage.setItem(storageKey, JSON.stringify(data.messages));
          } catch (error) {
            console.warn("No se pudo guardar el historial del chat:", error);
          }
          if (markRead) {
            window.dispatchEvent(new CustomEvent("rf-chat-read", { detail: { orderId } }));
          }
        }
      } catch (err) {
        if (active && !controller.signal.aborted) {
          console.warn("No se pudo actualizar el chat:", err);
          setLoadError(err instanceof Error ? err.message : "No se pudo actualizar el chat.");
        }
      } finally {
        fetching = false;
      }
    };

    fetchCloudMessages();
    const interval = setInterval(fetchCloudMessages, 2000);

    // 3. Escucha reactiva entre pestañas (Storage Event)
    const handleStorageChange = (e: StorageEvent) => {
      if (!isDriverViewer && e.key === storageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        } catch (error) {
          console.warn("No se pudo leer el historial del chat:", error);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    const handleIdentityChange = () => {
      if (authHeaders(role).Authorization !== authorization) {
        active = false;
        controller.abort();
        setMessages([]);
        onOpenChangeRef.current(false);
      }
    };
    window.addEventListener(isDriverViewer ? "repartofacil-driver-auth" : "repartofacil-client-auth", handleIdentityChange);
    window.addEventListener("storage", handleIdentityChange);

    return () => {
      active = false;
      controller.abort();
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(isDriverViewer ? "repartofacil-driver-auth" : "repartofacil-client-auth", handleIdentityChange);
      window.removeEventListener("storage", handleIdentityChange);
    };
  }, [isOpen, orderId, storageKey, isDriverViewer, clientId]);

  useEffect(() => {
    if (!isOpen) return;

    const currentLen = messages.length;
    const prevLen = prevMessagesLengthRef.current;

    if (isInitialLoadRef.current && currentLen > 0) {
      isInitialLoadRef.current = false;
      prevMessagesLengthRef.current = currentLen;
      setTimeout(() => scrollToBottom("auto"), 50);
      return;
    }

    if (currentLen === prevLen) {
      return;
    }

    if (currentLen > prevLen) {
      prevMessagesLengthRef.current = currentLen;
      if (isNearBottomRef.current) {
        setTimeout(() => scrollToBottom("smooth"), 50);
      } else {
        setHasNewMessagesBelow(true);
      }
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      isInitialLoadRef.current = true;
      isNearBottomRef.current = true;
      setHasNewMessagesBelow(false);
    }
  }, [isOpen, orderId]);

  const getMyAuthorName = () => {
    if (effectiveRole === "driver") {
      const dp = loadDriverProfile();
      return dp?.firstName || driverName || "Lucas Motomensajero";
    } else {
      const cp = loadClientProfile();
      return cp?.displayName || clientName || activeOrder?.clientName || "Cliente";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;
    const role = isDriverViewer ? "Driver" : "Client";
    const authorization = authHeaders(role).Authorization;
    const stillCurrent = () => chatContext.current.isOpen &&
      chatContext.current.orderId === orderId &&
      chatContext.current.isDriverViewer === isDriverViewer &&
      authHeaders(role).Authorization === authorization;

    const myName = getMyAuthorName();
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const newMsg: OrderChatMessage = {
      id: `msg-${Date.now()}`,
      orderId,
      authorRole: effectiveRole,
      authorName: myName,
      content: text,
      timestamp: timeStr,
    };

    setSendError(null);
    setIsSending(true);
    try {
      const response = await fetch(`/api/chat/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(authorization ? { Authorization: authorization } : {}) },
        body: JSON.stringify(newMsg),
      });
      if (!response.ok) {
        throw new Error(response.status === 401 || response.status === 403
          ? "Tu sesión no permite enviar mensajes. Volvé a iniciar sesión."
          : "No se pudo enviar el mensaje. Intentá nuevamente.");
      }
      const data = await response.json();
      if (!data.success || !data.message) throw new Error("El servidor no confirmó el mensaje.");
      if (!stillCurrent()) return;
      setMessages((current) => {
        const updated = current.some((message) => message.id === data.message.id)
          ? current
          : [...current, data.message];
        try {
          if (!isDriverViewer && clientId) localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (error) {
          console.warn("No se pudo guardar el chat local:", error);
        }
        return updated;
      });
      setInputText("");
      isNearBottomRef.current = true;
      setHasNewMessagesBelow(false);
      setTimeout(() => scrollToBottom("smooth"), 50);
    } catch (err) {
      console.warn("No se pudo enviar el mensaje:", err);
      if (stillCurrent()) setSendError(err instanceof Error ? err.message : "No se pudo enviar el mensaje. Intentá nuevamente.");
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    isSending,
    sendError,
    loadError,
    hasNewMessagesBelow,
    scrollRef,
    handleScroll,
    scrollToBottom,
    handleSendMessage,
    getMyAuthorName,
  };
}
