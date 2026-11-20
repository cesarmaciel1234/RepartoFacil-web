"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Check, Home, Briefcase, Plus } from "lucide-react";

interface ModalCambiarDireccionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentAddress: string;
  onSelectAddress: (newAddress: string) => void;
}

export function ModalCambiarDireccion({
  isOpen,
  onOpenChange,
  currentAddress,
  onSelectAddress,
}: ModalCambiarDireccionProps) {
  const [addressInput, setAddressInput] = useState(currentAddress);

  useEffect(() => {
    setAddressInput(currentAddress);
  }, [currentAddress, isOpen]);

  const quickAddresses = [
    { label: "Tucumán 2130, Rosario", type: "Centro" },
    { label: "Bv. Oroño 1200, Rosario", type: "Paseo del Siglo" },
    { label: "Av. Pellegrini 1800, Rosario", type: "Pellegrini" },
    { label: "San Lorenzo 1920, Rosario", type: "Pichincha" },
  ];

  const handleSave = (addr: string) => {
    const clean = addr.trim() || "Tucumán 2130, Rosario";
    onSelectAddress(clean);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 w-[92vw] max-w-sm p-5 rounded-3xl">
        <DialogHeader className="text-left pb-2 border-b border-slate-800">
          <DialogTitle className="text-base font-black text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
              📍
            </span>
            Dirección de Entrega
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 mt-0.5">
            Ingresá dónde querés recibir tu pedido o elegí un punto sugerido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Input Editable */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">
              Calle y altura / Piso / Depto
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
              <Input
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Ej. Tucumán 2130, Piso 4 B, Rosario"
                className="pl-9 pr-3 h-11 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs rounded-xl focus:border-emerald-500 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave(addressInput);
                  }
                }}
              />
            </div>
          </div>

          {/* Direcciones Frecuentes / Rápidas */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Sugerencias y zonas en Rosario
            </span>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {quickAddresses.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setAddressInput(item.label);
                    handleSave(item.label);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all active:scale-[0.99] ${
                    addressInput === item.label
                      ? "bg-emerald-500/15 border-emerald-500/50 text-white"
                      : "bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold block truncate">{item.label}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{item.type}</span>
                    </div>
                  </div>
                  {addressInput === item.label && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Botón Guardar */}
          <Button
            type="button"
            onClick={() => handleSave(addressInput)}
            className="w-full h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-98 transition-all"
          >
            Confirmar Dirección de Entrega
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
