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
  Send,
  User,
  ShieldCheck,
  Bike,
  ArrowLeft,
} from "lucide-react";
import { DriverOrder } from "../motor/tipos";
import { loadClientProfile, loadDriverProfile } from "../motor/driverService";
import { ModalTicketDigital } from "@/components/ModalTicketDigital";
import { OrderChatMessageList } from "./OrderChatMessageList";

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
  embedded?: boolean;
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
  embedded = false,
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
  const backButtonLabel = embedded ? "Volver al pedido" : "Volver a la lista de pedidos";

  const chatContent = (
    <>
        {/* Header Scoped: Diferenciado según el perfil del usuario */}
        <SheetHeader
          className={`flex flex-row items-center justify-between gap-2 border-b p-4 ${
            embedded ? "border-slate-100 bg-white" : "border-slate-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {onBackToOrdersHub && (
              <button
                type="button"
                onClick={onBackToOrdersHub}
                aria-label={backButtonLabel}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all ${
                  embedded
                    ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                    : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
                title={backButtonLabel}
              >
                <ArrowLeft className={`h-4 w-4 ${embedded ? "text-blue-600" : "text-emerald-400"}`} />
              </button>
            )}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-md ${
                embedded
                  ? "bg-blue-50 text-blue-600"
                  : isClientViewer
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {isClientViewer ? <Bike className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <SheetTitle className={`text-sm font-black ${embedded ? "text-slate-900" : "text-white"}`}>
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
                {!embedded && (activeOrder?.ticketId || (activeOrder as any)?.ticket_id) && (
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(true)}
                    className="flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9.5px] font-bold text-blue-700 transition-all hover:bg-blue-100"
                    title="Ver Ticket Digital Cobro Fácil"
                  >
                    🧾 Ticket #{activeOrder.ticketId || (activeOrder as any).ticket_id} ↗
                  </button>
                )}
              </div>
            </div>
          </div>
          <Badge
            className={`border py-0.5 text-[9px] font-black ${
              embedded
                ? "border-blue-100 bg-blue-50 text-blue-700"
                : "border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
            }`}
          >
            EN VIVO
          </Badge>
        </SheetHeader>

        {/* Tarjeta de Estado del Reparto (Estilo Uber Eats / Rappi) */}
        <div
          className={`flex items-center justify-between border-b px-4 py-2.5 ${
            embedded
              ? "border-blue-100 bg-blue-50/70"
              : isClientViewer
              ? "border-blue-500/20 bg-blue-950/30"
              : "border-emerald-500/20 bg-emerald-950/30"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${
                embedded ? "bg-white text-blue-700" : "bg-slate-800/90 text-white"
              }`}
            >
              {isClientViewer ? "🛵" : "👤"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`truncate text-xs font-black ${embedded ? "text-slate-900" : "text-white"}`}>
                  {isClientViewer ? driverName : (clientName || activeOrder?.clientName || "Familia Gómez")}
                </span>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    embedded ? "bg-blue-100 text-blue-700" : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {isClientViewer ? "En viaje" : "Esperando entrega"}
                </span>
              </div>
              <p className={`truncate text-[10px] font-medium ${embedded ? "text-slate-600" : "text-slate-400"}`}>
                {isClientViewer ? `Entrega en: ${displayDestAddress}` : `Destino: ${displayDestAddress}`}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 pl-2">
            <span className={`text-xs font-black ${embedded ? "text-blue-700" : "text-emerald-400"}`}>
              12-15 min
            </span>
            <span className={`block text-[9px] font-medium ${embedded ? "text-slate-500" : "text-slate-400"}`}>
              GPS activo
            </span>
          </div>
        </div>

        {/* Barra de perfil activo (Auditoría de Identidad) */}
        <div
          className={`flex items-center justify-between border-b px-4 py-1.5 text-[11px] ${
            embedded
              ? "border-slate-100 bg-white text-slate-500"
              : "border-slate-800/80 bg-slate-950/80 text-slate-400"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className={`h-3.5 w-3.5 ${embedded ? "text-blue-600" : "text-emerald-400"}`} />
            <span>
              Conectado como:{" "}
              <strong className={embedded ? "text-slate-900" : "text-white"}>
                {getMyAuthorName()} ({isClientViewer ? "Comprador" : "Repartidor"})
              </strong>
            </span>
          </div>
          <span className={`text-[10px] ${embedded ? "text-slate-400" : "text-slate-500"}`}>Cobro Fácil Sync</span>
        </div>

        <OrderChatMessageList
          messages={messages}
          effectiveRole={effectiveRole}
          embedded={embedded}
          scrollRef={scrollRef}
        />

        {/* Input de Mensaje Scoped a la Cuenta Actual */}
        <form
          onSubmit={handleSendMessage}
          className={`flex items-center gap-2 border-t p-3 ${
            embedded ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-950"
          }`}
        >
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isClientViewer
                ? `Escribir mensaje a ${driverName}...`
                : `Escribir mensaje al cliente (${clientName || activeOrder?.clientName || "Cliente"})...`
            }
            className={
              embedded
                ? "h-10 rounded-xl border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                : "h-10 rounded-xl border-slate-800 bg-slate-900 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500"
            }
          />
          <Button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className={`h-10 w-10 p-0 rounded-xl text-white shrink-0 shadow-lg active:scale-95 transition-all ${
              embedded || isClientViewer
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 disabled:opacity-40"
                : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 disabled:opacity-40"
            }`}
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {/* Modal Ticket Digital Cobro Fácil */}
        {!embedded && (
          <ModalTicketDigital
            isOpen={isTicketModalOpen}
            onOpenChange={setIsTicketModalOpen}
            order={activeOrder}
          />
        )}
    </>
  );

  if (embedded) {
    return <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">{chatContent}</div>;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full flex-col border-l border-slate-800 bg-slate-900 p-0 text-slate-100 sm:max-w-md">
        {chatContent}
      </SheetContent>
    </Sheet>
  );
}
