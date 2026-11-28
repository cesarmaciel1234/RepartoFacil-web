"use client";

import React, { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowDown } from "lucide-react";
import { formatShortOrderCode } from "../motor/tipos";
import { ModalTicketDigital } from "@/components/ModalTicketDigital";
import { OrderChatMessageList } from "./OrderChatMessageList";
import { OrderChatHeader } from "./OrderChatHeader";
import { useOrderChat, ChatAuthorRole, OrderChatMessage } from "../motor/useOrderChat";

export type { ChatAuthorRole, OrderChatMessage };

export interface OrderChatSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  embedded?: boolean;
  activeOrder?: {
    id: string;
    status?: string;
    clientName?: string;
    deliveryAddress?: string;
    ticketId?: string;
    ticket_id?: string;
  } | null;
  driverName?: string;
  clientName?: string;
  viewerRole?: "client" | "driver";
  defaultRole?: "client" | "driver";
  deliveryAddress?: string;
  onBackToOrdersHub?: () => void;
  backButtonLabel?: string;
  conversationTitle?: string;
  reserveCloseButton?: boolean;
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
  backButtonLabel: customBackButtonLabel,
  conversationTitle,
  reserveCloseButton = false,
}: OrderChatSheetProps) {
  const effectiveRole: "client" | "driver" = viewerRole || defaultRole;
  const isDriverViewer = effectiveRole === "driver";
  const isClientViewer = effectiveRole === "client";
  const orderId = activeOrder?.id || "RF-7420";
  const ticketLabel = formatShortOrderCode(activeOrder?.id || orderId);
  const displayDestAddress = deliveryAddress || activeOrder?.deliveryAddress || "Doctor Aráoz Alfaro 1964, Monterrey, Presidente Derqui";
  const interlocutorName = isDriverViewer
    ? (clientName || activeOrder?.clientName || (activeOrder as any)?.customerName || "Cliente")
    : (driverName || (activeOrder as any)?.driverName || "Repartidor");
  const backButtonLabel = customBackButtonLabel || (isDriverViewer ? "Volver a mensajes" : embedded ? "Volver al pedido" : "Volver a mensajes");

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const {
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
  } = useOrderChat({
    isOpen,
    orderId,
    effectiveRole,
    driverName,
    clientName,
    activeOrder,
    onOpenChange,
  });

  const chatContent = (
    <>
      <OrderChatHeader
        embedded={embedded}
        isDriverViewer={isDriverViewer}
        isClientViewer={isClientViewer}
        reserveCloseButton={reserveCloseButton}
        onBackToOrdersHub={onBackToOrdersHub}
        backButtonLabel={backButtonLabel}
        interlocutorName={interlocutorName}
        conversationTitle={conversationTitle}
        displayDestAddress={displayDestAddress}
        ticketLabel={ticketLabel}
        myAuthorName={getMyAuthorName()}
        activeOrder={activeOrder}
        onOpenTicketModal={() => setIsTicketModalOpen(true)}
      />

      {loadError && (
        <p role="status" className={`px-3 pt-2 text-xs ${embedded || isDriverViewer ? "text-amber-800" : "text-amber-300"}`}>
          {loadError}
        </p>
      )}

      <div className="relative min-h-0 flex-1 flex flex-col">
        <OrderChatMessageList
          messages={messages}
          effectiveRole={effectiveRole}
          embedded={embedded && !isDriverViewer}
          scrollRef={scrollRef}
          onScroll={handleScroll}
        />
        {hasNewMessagesBelow && (
          <button
            type="button"
            onClick={() => scrollToBottom("smooth")}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black shadow-lg flex items-center gap-1.5 active:scale-95 transition-all animate-bounce"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Mensajes nuevos abajo ↓</span>
          </button>
        )}
      </div>

      {sendError && <p role="alert" className="px-3 pt-1 text-xs text-red-700">{sendError}</p>}

      <form
        onSubmit={handleSendMessage}
        className={`flex items-center gap-2 border-t p-3 ${
          embedded || isDriverViewer ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-950"
        }`}
      >
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isClientViewer
              ? "Escribir al grupo..."
              : `Escribir mensaje al cliente (${clientName || activeOrder?.clientName || "Cliente"})...`
          }
          className={
            isDriverViewer
              ? "h-10 rounded-xl border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:ring-yellow-400"
              : embedded
              ? "h-10 rounded-xl border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
              : "h-10 rounded-xl border-slate-800 bg-slate-900 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500"
          }
        />
        <Button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className={`h-10 w-10 p-0 rounded-xl text-white shrink-0 shadow-lg active:scale-95 transition-all ${
            isDriverViewer
              ? "bg-[#FFE600] hover:bg-yellow-300 text-[#2D3277] shadow-yellow-500/20 disabled:opacity-40"
              : embedded || isClientViewer
              ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 disabled:opacity-40"
              : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 disabled:opacity-40"
          }`}
          title="Enviar mensaje"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {(!embedded || isDriverViewer) && (
        <ModalTicketDigital
          isOpen={isTicketModalOpen}
          onOpenChange={setIsTicketModalOpen}
          order={activeOrder}
          viewerRole={isDriverViewer ? "Driver" : "Client"}
        />
      )}
    </>
  );

  if (embedded) {
    return <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">{chatContent}</div>;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className={`flex h-full w-full flex-col p-0 sm:max-w-md ${
          isDriverViewer
            ? "border-l border-slate-200 bg-white text-slate-900"
            : "border-l border-slate-800 bg-slate-900 text-slate-100"
        }`}
      >
        {chatContent}
      </SheetContent>
    </Sheet>
  );
}
