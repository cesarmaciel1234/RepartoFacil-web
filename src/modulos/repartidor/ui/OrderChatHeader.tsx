"use client";

import React from "react";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ArrowLeft, Bike, User, ShieldCheck } from "lucide-react";
import { formatShortOrderCode } from "../motor/tipos";

export interface OrderChatHeaderProps {
  embedded: boolean;
  isDriverViewer: boolean;
  isClientViewer: boolean;
  reserveCloseButton: boolean;
  onBackToOrdersHub?: () => void;
  backButtonLabel: string;
  interlocutorName: string;
  conversationTitle?: string;
  displayDestAddress: string;
  ticketLabel: string;
  myAuthorName: string;
  activeOrder?: any;
  onOpenTicketModal: () => void;
}

export function OrderChatHeader({
  embedded,
  isDriverViewer,
  isClientViewer,
  reserveCloseButton,
  onBackToOrdersHub,
  backButtonLabel,
  interlocutorName,
  conversationTitle,
  displayDestAddress,
  ticketLabel,
  myAuthorName,
  activeOrder,
  onOpenTicketModal,
}: OrderChatHeaderProps) {
  return (
    <>
      <SheetHeader
        className={`flex flex-row items-center justify-between gap-2 border-b p-3 sm:p-4 ${reserveCloseButton ? "pr-12" : ""} ${
          embedded || isDriverViewer
            ? "border-slate-100 bg-white"
            : "border-slate-800 bg-slate-900"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2 flex-1">
          {onBackToOrdersHub && (
            <button
              type="button"
              onClick={onBackToOrdersHub}
              autoFocus={reserveCloseButton}
              aria-label={backButtonLabel}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all ${
                isDriverViewer
                  ? "border-yellow-300 bg-yellow-50 text-yellow-900 hover:bg-yellow-100"
                  : embedded
                  ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
              title={backButtonLabel}
            >
              <ArrowLeft
                className={`h-4 w-4 ${
                  isDriverViewer ? "text-yellow-800" : embedded ? "text-blue-600" : "text-emerald-400"
                }`}
              />
            </button>
          )}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
              isDriverViewer
                ? "bg-yellow-100 text-yellow-900"
                : embedded
                ? "bg-blue-50 text-blue-600"
                : isClientViewer
                ? "bg-blue-500/20 text-blue-400"
                : "bg-emerald-500/20 text-emerald-400"
            }`}
          >
            {isClientViewer ? <Bike className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-1.5">
              {embedded ? (
                <h2 className="truncate text-sm font-black text-slate-900" title={interlocutorName}>
                  {conversationTitle || interlocutorName}
                </h2>
              ) : (
                <SheetTitle className={`text-sm font-black truncate ${isDriverViewer ? "text-slate-900" : "text-white"}`} title={interlocutorName}>
                  {conversationTitle || interlocutorName}
                </SheetTitle>
              )}
            </div>
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-slate-500">
              <span
                title={displayDestAddress}
                className="truncate font-semibold text-slate-600 max-w-[130px] sm:max-w-[200px]"
              >
                📍 {displayDestAddress}
              </span>
              {isDriverViewer && (
                <button
                  type="button"
                  onClick={onOpenTicketModal}
                  className="flex shrink-0 items-center gap-1 rounded-md border border-yellow-300 bg-yellow-50 px-1.5 py-0.5 text-[9.5px] font-bold text-yellow-900 hover:bg-yellow-100 transition-all"
                  title="Ver Ticket Digital Cobro Fácil"
                >
                  <span>🧾 {ticketLabel} ↗</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Punto verde pulsante de estado en vivo */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1" title="Canal de chat en vivo">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white" />
          </span>
        </div>
      </SheetHeader>

      {!isDriverViewer && (
        <p className={`border-b px-4 py-2 text-xs ${embedded ? "border-blue-100 bg-blue-50 text-blue-800" : "border-slate-800 bg-slate-900 text-slate-300"}`}>
          {["delivered", "cancelled", "cancelled_by_client", "cancelled_timeout", "rejected"].includes(String(activeOrder?.status || "").toLowerCase())
            ? "Conversación entre comprador y empresa. Se conservan los mensajes anteriores."
            : "Comparten este chat el comprador, la empresa y el repartidor asignado hasta la entrega."}
        </p>
      )}

      {/* Barra de perfil activo */}
      <div
        className={`flex items-center justify-between border-b px-4 py-1.5 text-[11px] ${
          embedded
            ? "border-slate-100 bg-white text-slate-500"
            : isDriverViewer
            ? "border-slate-100 bg-white text-slate-500"
            : "border-slate-800/80 bg-slate-950/80 text-slate-400"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <ShieldCheck
            className={`h-3.5 w-3.5 ${
              embedded ? "text-blue-600" : isDriverViewer ? "text-yellow-800" : "text-emerald-400"
            }`}
          />
          <span>
            Conectado como:{" "}
            <strong className={embedded || isDriverViewer ? "text-slate-900" : "text-white"}>
              {myAuthorName} ({isClientViewer ? "Comprador" : "Repartidor"})
            </strong>
          </span>
        </div>
        <span
          className={`text-[10px] ${
            embedded || isDriverViewer ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Cobro Fácil Sync
        </span>
      </div>
    </>
  );
}
