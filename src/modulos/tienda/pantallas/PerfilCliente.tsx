"use client";

import React from "react";
import {
  ChevronRight,
  Headphones,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Truck,
  UserRound,
} from "lucide-react";
import type { ClientProfile } from "@/modulos/repartidor/motor/driverService";

interface PerfilClienteProps {
  clientProfile: ClientProfile | null;
  deliveryAddress: string;
  onLogin: () => void;
  onLogout: () => void;
  onEditAddress: () => void;
  onSwitchToDriver: () => void;
}

export function PerfilCliente({
  clientProfile,
  deliveryAddress,
  onLogin,
  onLogout,
  onEditAddress,
  onSwitchToDriver,
}: PerfilClienteProps) {
  const displayName = clientProfile?.displayName || "Cliente Reparto Fácil";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <article className="flex items-center gap-4 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-black text-white shadow-md shadow-blue-600/20">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-extrabold text-slate-900">{displayName}</h2>
          <p className="truncate text-sm text-slate-500">
            {clientProfile?.email || "Ingresá para guardar tus datos y pedidos"}
          </p>
        </div>
        {clientProfile ? (
          <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700">
            Cliente
          </span>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            className="flex shrink-0 items-center gap-1 rounded-full bg-blue-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
          >
            <LogIn className="h-3.5 w-3.5" />
            Iniciar sesión
          </button>
        )}
      </article>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Datos personales
        </h2>
        {clientProfile && (
          <>
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <UserRound className="h-4 w-4 text-blue-600" />
              <span className="flex-1 text-sm text-slate-700">{clientProfile.displayName}</span>
            </div>
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <Phone className="h-4 w-4 text-blue-600" />
              <span className="flex-1 text-sm text-slate-700">
                {clientProfile.phone || "Teléfono sin agregar"}
              </span>
            </div>
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="flex-1 truncate text-sm text-slate-700">{clientProfile.email}</span>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={onEditAddress}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-blue-50/50"
        >
          <MapPin className="h-4 w-4 shrink-0 text-blue-600" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-medium text-slate-500">Dirección de entrega</span>
            <span className="block truncate text-sm font-semibold text-slate-800">{deliveryAddress}</span>
          </span>
          <Pencil className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </section>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onSwitchToDriver}
          className="flex w-full items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-left transition-colors hover:bg-blue-100/70"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Truck className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block font-bold text-slate-900">Conectarse como repartidor</span>
            <span className="block text-xs text-slate-600">Ver pedidos disponibles y repartir</span>
          </span>
          <ChevronRight className="h-4 w-4 text-blue-600" />
        </button>

        <a
          href="https://wa.me/5491100000000"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/50"
        >
          <Headphones className="h-5 w-5 text-blue-600" />
          <span className="flex-1 text-sm font-bold text-slate-800">Ayuda y soporte</span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </a>
      </div>

      {clientProfile && (
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      )}
    </section>
  );
}
