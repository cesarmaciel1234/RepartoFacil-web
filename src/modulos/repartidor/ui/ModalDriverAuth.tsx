"use client";

import React, { useState } from "react";
import { DriverOrder, DriverProfile } from "../motor/tipos";
import { saveDriverProfile } from "../motor/driverService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc, setDoc } from "@/firebase/local-firestore";

interface ModalDriverAuthProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pendingOrder: DriverOrder | null;
  onSuccess: (driverId: string) => void;
}

export function ModalDriverAuth({
  isOpen,
  onOpenChange,
  pendingOrder,
  onSuccess,
}: ModalDriverAuthProps) {
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState<"Motorcycle" | "Bicycle" | "Car">("Motorcycle");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Ingresá tu nombre", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const driverId = `driver-${Date.now().toString(36)}`;
      const profile: DriverProfile = {
        id: driverId,
        uid: driverId,
        firstName: name.trim(),
        role: "Driver",
        vehicleType: vehicle,
        availabilityStatus: "Available",
        createdAt: new Date().toISOString(),
      };

      saveDriverProfile(profile);

      // Guardar también en Firestore si está disponible
      if (firestore) {
        try {
          setDoc(doc(firestore, "driverProfiles", driverId), {
            id: driverId,
            firstName: name.trim(),
            vehicleType: vehicle,
            availabilityStatus: "Available",
            updatedAt: new Date().toISOString(),
          });
        } catch {}
      }

      onSuccess(driverId);
    } catch {
      toast({ title: "Error al identificar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm p-6 rounded-3xl">
        <DialogHeader className="text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
            <Truck className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-black text-white">
            Identificación de Repartidor
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {pendingOrder
              ? `Para tomar el pedido #${pendingOrder.id}, por favor ingresá tu nombre de conductor.`
              : "Ingresá tus datos para registrar tus entregas y sincronizar con la central."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleStart} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Tu Nombre y Apellido *
            </label>
            <Input
              placeholder="Ej. Lucas Motomensajero"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white rounded-xl text-xs h-10"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Vehículo de Reparto
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Motorcycle", label: "Moto", icon: "🏍️" },
                { id: "Bicycle", label: "Bici", icon: "🚲" },
                { id: "Car", label: "Auto", icon: "🚗" },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicle(v.id as any)}
                  className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${
                    vehicle === v.id
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="text-sm">{v.icon}</span>
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
          >
            <span>{loading ? "Registrando..." : "Comenzar Reparto"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
