"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Send,
  Truck,
  User,
  Store,
  ExternalLink,
  Sparkles,
  CheckCheck,
  ShieldCheck,
  Bike,
  ArrowLeft,
} from "lucide-react";
import { DriverOrder } from "../motor/tipos";
import { loadClientProfile, loadDriverProfile } from "../motor/driverService";
import { ModalTicketDigital } from "@/components/ModalTicketDigital";

export type ChatAuthorRole = "driver" | "client" | "company";

export interface OrderChatMessage {
  id: string;
  orderId: string;
  authorRole: ChatAuthorRole;
  authorName: string;
  content: string;
  timestamp: string;
}

const DEFAULT_MESSAGES: OrderChatMessage[] = [
  {
    id: "msg-1",
    orderId: "RF-7420",
    authorRole: "company",
    authorName: "Central Frigorífico Maciel (CobroFácil)",
    content: "¡Pedido #RF-7420 preparado y embalado en sucursal! Listo para que el repartidor retire.",
    timestamp: "18:40",
  },
  {
    id: "msg-2",
    orderId: "RF-7420",
    authorRole: "driver",
    authorName: "Lucas Motomensajero",
    content: "Pedido retirado del local. En viaje hacia San Lorenzo 2040 en moto. Demora estimada: 15 minutos.",
    timestamp: "18:44",
  },
  {
    id: "msg-3",
    orderId: "RF-7420",
    authorRole: "client",
    authorName: "Familia Gómez",
    content: "¡Excelente! Por favor tocar el timbre 3B o avisar por acá al llegar.",
    timestamp: "18:46",
  },
];

interface OrderChatSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeOrder?: DriverOrder | null;
  driverName?: string;
  clientName?: string;
  viewerRole?: "client" | "driver";
  defaultRole?: "client" | "driver"; // compatibilidad
  deliveryAddress?: string;
  onBackToOrdersHub?: () => void;
}

export function OrderChatSheet({
  isOpen,
  onOpenChange,
  activeOrder,
  driverName = "Lucas Motomensajero",
  clientName,
  viewerRole,
  defaultRole = "client",
  deliveryAddress,
  onBackToOrdersHub,
}: OrderChatSheetProps) {
  // El rol real del usuario que visualiza el chat
  const effectiveRole: "client" | "driver" = viewerRole || defaultRole;
  const orderId = activeOrder?.id || "RF-7420";
  const storageKey = `rf_chat_${orderId}`;

  const [messages, setMessages] = useState<OrderChatMessage[]>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final del chat
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // Cargar mensajes persistentes y sincronizar con backend PostgreSQL
  useEffect(() => {
    if (!isOpen) return;

    // 1. Cargar caché local primero
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } else {
        setMessages([
          {
            id: `welcome-${orderId}`,
            orderId,
            authorRole: "company",
            authorName: "Central CobroFácil",
            content: `¡Canal directo abierto para el Pedido #${orderId}! Podés coordinar la entrega en tiempo real entre el repartidor y el cliente.`,
            timestamp: "Ahora",
          },
        ]);
      }
    } catch {}

    // 2. Sincronizar con API cloud /api/chat/[orderId]
    const fetchCloudMessages = async () => {
      try {
        const res = await fetch(`/api/chat/${orderId}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(data.messages);
            localStorage.setItem(storageKey, JSON.stringify(data.messages));
          }
        }
      } catch (err) {
        // Red offline o fallback local
      }
    };

    fetchCloudMessages();
    const interval = setInterval(fetchCloudMessages, 2000);

    // 3. Escucha reactiva entre pestañas (Storage Event)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isOpen, orderId, storageKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Nombre resuelto del autor según su cuenta real
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

    // Actualización optimista inmediata
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputText("");
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}

    // Persistencia en base de datos PostgreSQL de Cobro Fácil
    setIsSending(true);
    try {
      await fetch(`/api/chat/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });
    } catch (err) {
      console.warn("Aviso guardando mensaje en la nube:", err);
    } finally {
      setIsSending(false);
    }
  };

  const isClientViewer = effectiveRole === "client";
  const displayDestAddress = deliveryAddress || activeOrder?.deliveryAddress || "Tucumán 2130, Rosario";

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 p-0 flex flex-col h-full">
        {/* Header Scoped: Diferenciado según el perfil del usuario */}
        <SheetHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onBackToOrdersHub && (
              <button
                type="button"
                onClick={onBackToOrdersHub}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center shrink-0 border border-slate-700 transition-all"
                title="Volver a la lista de pedidos"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400" />
              </button>
            )}
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              isClientViewer ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"
            }`}>
              {isClientViewer ? <Bike className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <SheetTitle className="text-sm font-black text-white">
                  {isClientViewer
                    ? `Chat con tu Repartidor`
                    : `Chat con el Cliente`}
                </SheetTitle>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400 font-medium">
                  Pedido #{orderId}
                </span>
                {(activeOrder?.ticketId || (activeOrder as any)?.ticket_id) && (
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(true)}
                    className="text-[9.5px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/30 px-1.5 py-0.2 rounded-md flex items-center gap-1 transition-all"
                    title="Ver Ticket Digital Cobro Fácil"
                  >
                    🧾 Ticket #{activeOrder.ticketId || (activeOrder as any).ticket_id} ↗
                  </button>
                )}
              </div>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black py-0.5">
            EN VIVO
          </Badge>
        </SheetHeader>

        {/* Tarjeta de Estado del Reparto (Estilo Uber Eats / Rappi) */}
        <div className={`px-4 py-2.5 border-b flex items-center justify-between ${
          isClientViewer ? "bg-blue-950/30 border-blue-500/20" : "bg-emerald-950/30 border-emerald-500/20"
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-800/90 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {isClientViewer ? "🛵" : "👤"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white truncate">
                  {isClientViewer ? driverName : (clientName || activeOrder?.clientName || "Familia Gómez")}
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full font-bold shrink-0">
                  {isClientViewer ? "En viaje" : "Esperando entrega"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {isClientViewer ? `Entrega en: ${displayDestAddress}` : `Destino: ${displayDestAddress}`}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 pl-2">
            <span className="text-xs font-black text-emerald-400">12-15 min</span>
            <span className="block text-[9px] text-slate-400 font-medium">GPS activo</span>
          </div>
        </div>

        {/* Barra de perfil activo (Auditoría de Identidad) */}
        <div className="px-4 py-1.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Conectado como:{" "}
              <strong className="text-white">
                {getMyAuthorName()} ({isClientViewer ? "Comprador" : "Repartidor"})
              </strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Cobro Fácil Sync</span>
        </div>

        {/* Lista de Mensajes: Tu mensaje a la derecha, otros a la izquierda */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => {
            const isMe = m.authorRole === effectiveRole;
            const isDriver = m.authorRole === "driver";
            const isClient = m.authorRole === "client";
            const isCompany = m.authorRole === "company";

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {/* Remitente y Hora */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px]">
                  {isDriver && (
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> {m.authorName} {isMe ? "(Tú)" : "(Repartidor)"}
                    </span>
                  )}
                  {isClient && (
                    <span className="font-bold text-blue-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> {m.authorName} {isMe ? "(Tú)" : "(Cliente)"}
                    </span>
                  )}
                  {isCompany && (
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Store className="w-3 h-3" /> {m.authorName}
                    </span>
                  )}
                  <span className="text-slate-500">{m.timestamp}</span>
                </div>

                {/* Burbuja del Mensaje */}
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed shadow-md ${
                    isMe
                      ? effectiveRole === "driver"
                        ? "bg-emerald-600 text-white rounded-br-xs"
                        : "bg-blue-600 text-white rounded-br-xs"
                      : isCompany
                      ? "bg-slate-800 border border-amber-500/30 text-amber-100 rounded-bl-xs"
                      : isDriver
                      ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 rounded-bl-xs"
                      : "bg-blue-950/80 border border-blue-500/40 text-blue-100 rounded-bl-xs"
                  }`}
                >
                  <p>{m.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input de Mensaje Scoped a la Cuenta Actual */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
        >
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isClientViewer
                ? `Escribir mensaje a ${driverName}...`
                : `Escribir mensaje al cliente (${clientName || activeOrder?.clientName || "Cliente"})...`
            }
            className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 rounded-xl text-xs h-10 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <Button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className={`h-10 w-10 p-0 rounded-xl text-white shrink-0 shadow-lg active:scale-95 transition-all ${
              isClientViewer
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 disabled:opacity-40"
                : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 disabled:opacity-40"
            }`}
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {/* Modal Ticket Digital Cobro Fácil */}
        <ModalTicketDigital
          isOpen={isTicketModalOpen}
          onOpenChange={setIsTicketModalOpen}
          order={activeOrder}
        />
      </SheetContent>
    </Sheet>
  );
}
