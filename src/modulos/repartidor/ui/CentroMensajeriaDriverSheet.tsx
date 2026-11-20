"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Search,
  CheckCheck,
  User,
  Truck,
  Store,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { DriverOrder } from "../motor/tipos";

interface CentroMensajeriaDriverSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orders: DriverOrder[];
  onSelectOrderChat: (order: DriverOrder) => void;
}

interface ChatConversationSummary {
  order: DriverOrder;
  lastMessage: string;
  lastSender: string;
  lastTime: string;
  timestampMs: number;
  unread: boolean;
}

export function CentroMensajeriaDriverSheet({
  isOpen,
  onOpenChange,
  orders = [],
  onSelectOrderChat,
}: CentroMensajeriaDriverSheetProps) {
  const [searchFilter, setSearchFilter] = useState("");
  const [chatSummaries, setChatSummaries] = useState<ChatConversationSummary[]>([]);

  // Cargar últimos mensajes y ordenar: el más nuevo se posiciona primero (Estilo WhatsApp)
  useEffect(() => {
    if (!isOpen && orders.length === 0) return;

    const loadSummaries = () => {
      const summaries: ChatConversationSummary[] = orders.map((order) => {
        let lastMessage = "Toca para abrir canal directo y coordinar entrega.";
        let lastSender = "Sistema";
        let lastTime = "Reciente";
        let timestampMs = order.updatedAt
          ? new Date(order.updatedAt).getTime()
          : order.createdAt
          ? new Date(order.createdAt).getTime()
          : Date.now();

        try {
          const raw = localStorage.getItem(`rf_chat_${order.id}`);
          if (raw) {
            const msgs = JSON.parse(raw);
            if (Array.isArray(msgs) && msgs.length > 0) {
              const latest = msgs[msgs.length - 1];
              lastMessage = latest.content || lastMessage;
              lastSender =
                latest.authorRole === "driver"
                  ? "Tú"
                  : latest.authorRole === "client"
                  ? "Cliente"
                  : "Comercio";
              lastTime = latest.timestamp || lastTime;
              if (latest.id && latest.id.startsWith("msg-")) {
                const parsedId = Number(latest.id.replace("msg-", ""));
                if (!isNaN(parsedId)) timestampMs = parsedId;
              }
            }
          }
        } catch {}

        return {
          order,
          lastMessage,
          lastSender,
          lastTime,
          timestampMs,
          unread: false,
        };
      });

      // Ordenar: el más nuevo se posiciona primero
      summaries.sort((a, b) => b.timestampMs - a.timestampMs);
      setChatSummaries(summaries);
    };

    loadSummaries();
    const interval = setInterval(loadSummaries, 3000);
    window.addEventListener("storage", loadSummaries);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", loadSummaries);
    };
  }, [isOpen, orders]);

  // Filtrado por buscador
  const filteredConversations = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return chatSummaries;

    return chatSummaries.filter((c) => {
      const name = (c.order.clientName || c.order.customerName || "").toLowerCase();
      const id = (c.order.id || "").toLowerCase();
      const branch = (c.order.branch || "").toLowerCase();
      const msg = c.lastMessage.toLowerCase();
      return (
        name.includes(q) ||
        id.includes(q) ||
        branch.includes(q) ||
        msg.includes(q)
      );
    });
  }, [chatSummaries, searchFilter]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-slate-950 border-l border-slate-800 text-slate-100 p-0 flex flex-col h-full font-sans select-none"
      >
        {/* Cabecera Tipo WhatsApp Verde Esmeralda */}
        <SheetHeader className="p-4 bg-slate-900 border-b border-slate-800 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-left">
              <SheetTitle className="text-sm font-black text-white flex items-center gap-1.5">
                Mensajería de Entrega
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </SheetTitle>
              <p className="text-[11px] text-slate-400 font-medium">
                {orders.length} chat{orders.length === 1 ? "" : "s"} activos con clientes y locales
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold py-0.5">
            EN VIVO
          </Badge>
        </SheetHeader>

        {/* Buscador de Chats (Estilo WhatsApp) */}
        <div className="p-3 border-b border-slate-800 bg-slate-950">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar por cliente, pedido o comercio..."
              className="pl-9 h-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 rounded-xl text-xs focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Lista de Conversaciones (Tipo WhatsApp - El nuevo primero) */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
          {filteredConversations.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 mx-auto flex items-center justify-center border border-slate-800">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Sin conversaciones activas</h4>
              <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                Cuando aceptes pedidos en tu ruta, los canales de mensajería privada con cada cliente aparecerán acá ordenados automáticamente por el mensaje más reciente.
              </p>
            </div>
          ) : (
            filteredConversations.map((item) => {
              const client =
                item.order.clientName || item.order.customerName || "Cliente";
              const initials = client
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "C";
              const store = item.order.branch || "Sucursal";

              return (
                <button
                  key={item.order.id}
                  type="button"
                  onClick={() => onSelectOrderChat(item.order)}
                  className="w-full p-3.5 flex items-start gap-3 hover:bg-slate-900/90 active:bg-slate-850 transition-colors text-left group"
                >
                  {/* Avatar con Iniciales y Punto En Línea */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-slate-800 border border-emerald-500/30 flex items-center justify-center font-black text-sm text-white shadow-md group-hover:border-emerald-400 transition-colors">
                      {initials}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  </div>

                  {/* Detalle de la Conversación */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-black text-xs text-white truncate">
                          {client}
                        </span>
                        <Badge className="bg-emerald-500/15 text-emerald-300 border-none text-[9px] font-mono font-bold px-1.5 py-0 shrink-0">
                          #{item.order.id}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 font-mono">
                        {item.lastTime}
                      </span>
                    </div>

                    {/* Comercio y Destino */}
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate mb-1">
                      <Store className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{store}</span>
                    </div>

                    {/* Último Mensaje Snippet (Estilo WhatsApp) */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-300 truncate">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">
                        <strong className="text-slate-400 font-semibold">
                          {item.lastSender}:
                        </strong>{" "}
                        {item.lastMessage}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 shrink-0 self-center transition-colors" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Informativo */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Ordenado por mensaje más reciente
          </span>
          <span className="text-slate-500">Cobro Fácil Sync</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
