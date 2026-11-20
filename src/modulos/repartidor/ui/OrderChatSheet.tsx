"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { DriverOrder } from "../motor/tipos";

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
    authorName: "Lucas Motomensajero (Repartidor)",
    content: "Pedido retirado del local. En viaje hacia San Lorenzo 2040 en moto. Demora estimada: 15 minutos.",
    timestamp: "18:44",
  },
  {
    id: "msg-3",
    orderId: "RF-7420",
    authorRole: "client",
    authorName: "Familia Gómez (Cliente)",
    content: "¡Excelente! Por favor tocar el timbre 3B o avisar por acá al llegar.",
    timestamp: "18:46",
  },
];

interface OrderChatSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeOrder?: DriverOrder | null;
  driverName?: string;
  defaultRole?: ChatAuthorRole;
  deliveryAddress?: string;
}

export function OrderChatSheet({
  isOpen,
  onOpenChange,
  activeOrder,
  driverName = "Lucas Motomensajero",
  defaultRole = "driver",
  deliveryAddress,
}: OrderChatSheetProps) {
  const orderId = activeOrder?.id || "RF-7420";
  const storageKey = `rf_chat_${orderId}`;

  const [messages, setMessages] = useState<OrderChatMessage[]>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [activeRole, setActiveRole] = useState<ChatAuthorRole>(defaultRole);

  useEffect(() => {
    setActiveRole(defaultRole);
  }, [defaultRole, isOpen]);

  // Cargar historial persistente
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
      setMessages(DEFAULT_MESSAGES);
    } catch {
      setMessages(DEFAULT_MESSAGES);
    }
  }, [storageKey]);

  const saveMessages = (msgs: OrderChatMessage[]) => {
    setMessages(msgs);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(msgs));
      } catch {}
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    let authorName = driverName;
    if (activeRole === "client") authorName = activeOrder?.clientName || "Familia Gómez (Cliente)";
    if (activeRole === "company") authorName = "Central CobroFácil (Frigorífico Maciel)";

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const newMsg: OrderChatMessage = {
      id: `msg-${Date.now()}`,
      orderId,
      authorRole: activeRole,
      authorName,
      content: text,
      timestamp: timeStr,
    };

    saveMessages([...messages, newMsg]);
    setInputText("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 p-0 flex flex-col h-full">
        {/* Header Tripartito */}
        <SheetHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
              <Bell className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <SheetTitle className="text-sm font-black text-white">
                  Chat de Entrega #{orderId}
                </SheetTitle>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Repartidor · Cliente · Central Empresa
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black py-0.5">
            EN VIVO
          </Badge>
        </SheetHeader>

        {/* Banner de Ubicación y Estado del Repartidor en Vivo */}
        <div className="px-4 py-2.5 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              🏍️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white truncate">{driverName}</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full font-bold shrink-0">
                  En viaje
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                Destino: {deliveryAddress || "Tucumán 2130, Rosario"}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 pl-2">
            <span className="text-xs font-black text-emerald-400">12-15 min</span>
            <span className="block text-[9px] text-slate-400 font-medium">GPS activo</span>
          </div>
        </div>

        {/* Banner de Integración con CobroFácil Cloud */}
        <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 text-blue-300 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Enganchado a Cobro Fácil Cloud</span>
          </div>
          <a
            href="https://cobrofacil.onrender.com"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 underline"
          >
            <span>Ver Central</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Selector de Remitente para Simulación y Pruebas en Vivo */}
        <div className="p-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-1.5 text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Escribir como:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveRole("driver")}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                activeRole === "driver"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Truck className="w-3 h-3" />
              <span>Repartidor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRole("client")}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                activeRole === "client"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-3 h-3" />
              <span>Cliente</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRole("company")}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                activeRole === "company"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Store className="w-3 h-3" />
              <span>Empresa</span>
            </button>
          </div>
        </div>

        {/* Lista de Mensajes en Tiempo Real */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => {
            const isDriver = m.authorRole === "driver";
            const isClient = m.authorRole === "client";
            const isCompany = m.authorRole === "company";

            return (
              <div
                key={m.id}
                className={`flex flex-col ${
                  isDriver ? "items-end" : "items-start"
                }`}
              >
                {/* Cabecera del mensaje con rol */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px]">
                  {isDriver && (
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> {m.authorName}
                    </span>
                  )}
                  {isClient && (
                    <span className="font-bold text-blue-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> {m.authorName}
                    </span>
                  )}
                  {isCompany && (
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Store className="w-3 h-3" /> {m.authorName}
                    </span>
                  )}
                  <span className="text-slate-500">{m.timestamp}</span>
                </div>

                {/* Burbuja del mensaje */}
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed shadow-md ${
                    isDriver
                      ? "bg-emerald-600 text-white rounded-br-xs"
                      : isClient
                      ? "bg-blue-600 text-white rounded-bl-xs"
                      : "bg-slate-800 border border-amber-500/30 text-amber-100 rounded-bl-xs"
                  }`}
                >
                  <p>{m.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input de Mensaje y Envío */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
        >
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Escribir como ${
              activeRole === "driver"
                ? "repartidor..."
                : activeRole === "client"
                ? "cliente..."
                : "empresa..."
            }`}
            className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 rounded-xl text-xs h-10 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <Button
            type="submit"
            className={`h-10 w-10 p-0 rounded-xl text-white shrink-0 shadow-lg active:scale-95 transition-all ${
              activeRole === "driver"
                ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                : activeRole === "client"
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
            }`}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
