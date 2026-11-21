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
                  : latest.authorName || "Frigorífico Maciel";
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

    const syncDbChats = async () => {
      let changed = false;
      await Promise.all(
        orders.map(async (order) => {
          try {
            const resp = await fetch(`/api/chat/${order.id}`);
            const data = await resp.json();
            if (data && data.success && Array.isArray(data.messages) && data.messages.length > 0) {
              const currentRaw = localStorage.getItem(`rf_chat_${order.id}`);
              const newRaw = JSON.stringify(data.messages);
              if (currentRaw !== newRaw) {
                localStorage.setItem(`rf_chat_${order.id}`, newRaw);
                changed = true;
              }
            }
          } catch {}
        })
      );
      if (changed) {
        loadSummaries();
      }
    };

    loadSummaries();
    syncDbChats();
    const interval = setInterval(() => {
      loadSummaries();
      syncDbChats();
    }, 3000);
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
        className="w-full sm:max-w-md bg-white border-l border-slate-200 text-slate-900 p-0 flex flex-col h-full font-sans select-none"
      >
        <SheetHeader className="p-4 bg-white border-b border-slate-100 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0 shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-left">
              <SheetTitle className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                Mensajería de Entrega
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </SheetTitle>
              <p className="text-[11px] text-slate-500 font-medium">
                {orders.length} chat{orders.length === 1 ? "" : "s"} activos con clientes y locales
              </p>
            </div>
          </div>
          <Badge className="bg-yellow-100 text-yellow-900 border border-yellow-300 text-[10px] font-bold py-0.5">
            EN VIVO
          </Badge>
        </SheetHeader>

        {/* Buscador de Chats (Estilo WhatsApp) */}
        <div className="p-3 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar por cliente, pedido o comercio..."
              className="pl-9 h-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-xs focus:ring-yellow-400"
            />
          </div>
        </div>

        {/* Lista de Conversaciones (Tipo WhatsApp - El nuevo primero) */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-6">
              <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-700 mx-auto flex items-center justify-center border border-yellow-200">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Sin conversaciones activas</h4>
              <p className="text-xs text-slate-500 max-w-[240px] mx-auto leading-relaxed">
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
                  className="w-full p-3.5 flex items-start gap-3 hover:bg-yellow-50 active:bg-yellow-100 transition-colors text-left group"
                >
                  {/* Avatar con Iniciales y Punto En Línea */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-yellow-100 border border-yellow-300 flex items-center justify-center font-black text-sm text-[#2D3277] shadow-sm group-hover:border-yellow-500 transition-colors">
                      {initials}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>

                  {/* Detalle de la Conversación */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-black text-xs text-slate-900 truncate">
                          {client}
                        </span>
                        <Badge className="bg-yellow-100 text-yellow-900 border border-yellow-200 text-[9px] font-mono font-bold px-1.5 py-0 shrink-0">
                          #{item.order.id}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium shrink-0 font-mono">
                        {item.lastTime}
                      </span>
                    </div>

                    {/* Comercio y Destino */}
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 truncate mb-1">
                      <Store className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{store}</span>
                    </div>

                    {/* Último Mensaje Snippet (Estilo WhatsApp) */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 truncate">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">
                        <strong className="text-slate-700 font-semibold">
                          {item.lastSender}:
                        </strong>{" "}
                        {item.lastMessage}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-yellow-800 shrink-0 self-center transition-colors" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Informativo */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-yellow-800 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Ordenado por mensaje más reciente
          </span>
          <span className="text-slate-400">Cobro Fácil Sync</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
