"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DriverOrder, OrderStatus, DriverWallet } from "./tipos";
import {
  loadLocalOrders,
  saveLocalOrders,
  assignOrderToDriver,
  completeOrderDelivery,
} from "./driverService";
import { loadDriverWallet } from "./walletService";
import { useToast } from "@/hooks/use-toast";

export function useDriverOrders(currentDriverId?: string | null) {
  const { toast } = useToast();

  const [localOrders, setLocalOrders] = useState<DriverOrder[]>([]);
  const [pendingAcceptOrder, setPendingAcceptOrder] = useState<DriverOrder | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [wallet, setWallet] = useState<DriverWallet>(loadDriverWallet());
  const [isCompleting, setIsCompleting] = useState(false);

  // Cargar órdenes y wallet locales iniciales y sincronizar con base de datos PostgreSQL
  useEffect(() => {
    // 1. Cargar local primero
    const initial = loadLocalOrders();
    setLocalOrders(initial);
    setWallet(loadDriverWallet());

    // 2. Traer órdenes reales desde PostgreSQL crm-libro-local
    const fetchCloudOrders = async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (res.ok) {
          const cloudOrders: DriverOrder[] = await res.json();
          if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
            setLocalOrders((prev) => {
              // Combinar respetando el estado más reciente
              const map = new Map<string, DriverOrder>();
              cloudOrders.forEach((o: DriverOrder) => map.set(o.id, o));
              // Si localmente hay una orden que aún no se reflejó en red, conservarla
              prev.forEach((o) => {
                if (!map.has(o.id)) map.set(o.id, o);
              });
              const combined = Array.from(map.values());
              saveLocalOrders(combined);
              return combined;
            });
          }
        }
      } catch (err) {
        // Usar datos locales si no hay conexión
      }
    };

    fetchCloudOrders();
    const pollInterval = setInterval(fetchCloudOrders, 6000);

    const handleOrdersUpdated = () => {
      setLocalOrders(loadLocalOrders());
    };
    const handleWalletUpdated = (e: any) => {
      if (e.detail) setWallet(e.detail);
      else setWallet(loadDriverWallet());
    };
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "rf_orders_history" || !e.key) {
        setLocalOrders(loadLocalOrders());
        fetchCloudOrders();
      }
      if (e.key === "rf_driver_wallet" || !e.key) {
        setWallet(loadDriverWallet());
      }
    };

    window.addEventListener("rf-orders-updated", handleOrdersUpdated);
    window.addEventListener("rf-wallet-updated", handleWalletUpdated);
    window.addEventListener("storage", handleStorageEvent);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("rf-orders-updated", handleOrdersUpdated);
      window.removeEventListener("rf-wallet-updated", handleWalletUpdated);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  // Pedidos Disponibles en el radar del repartidor:
  // SOLO aquellos que fueron ACEPTADOS por el comercio en Cobro Fácil (Confirmed / Ready / Accepted)
  // Los pedidos 'pending_store' (esperando al comercio) o 'rejected'/'cancelled' NO salen al chofer.
  const availableOrders = useMemo(() => {
    return localOrders.filter(
      (o) =>
        (o.status === "Confirmed" ||
          (o.status as any) === "confirmed" ||
          o.status === "Ready" ||
          (o.status as any) === "ready" ||
          (o.status as any) === "accepted") &&
        !o.driverId
    );
  }, [localOrders]);

  // Mis pedidos activos en ruta: SOLO aquellos asignados EXCLUSIVAMENTE a este repartidor
  // IMPORTANTE: Pedidos 'Delivered' (entregados) o 'Cancelled' se archivan de la ruta y del chat del repartidor.
  const myActiveOrders = useMemo(() => {
    return localOrders.filter(
      (o) =>
        (o.status === "Assigned" ||
          o.status === "Picked Up" ||
          o.status === "In Transit") &&
        o.driverId &&
        (!currentDriverId || o.driverId === currentDriverId)
    );
  }, [localOrders, currentDriverId]);

  // Aceptar pedido: requiere login solo si no está identificado
  const handleTakeOrder = useCallback(
    async (order: DriverOrder, driverId?: string | null) => {
      const activeDriverId = driverId || currentDriverId;
      if (!activeDriverId) {
        setPendingAcceptOrder(order);
        setShowLoginModal(true);
        return;
      }

      // Actualización optimista inmediata
      setLocalOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, status: "Assigned" as OrderStatus, driverId: activeDriverId }
            : o
        )
      );

      const updated = await assignOrderToDriver(order.id, activeDriverId);
      setLocalOrders(updated);
      toast({
        title: "¡Pedido Asignado!",
        description: `El pedido #${order.id} fue agregado a tu ruta activa.`,
      });
    },
    [currentDriverId, toast]
  );

  // Confirmar pedido tras loguearse
  const confirmOrderAfterLogin = useCallback(
    async (driverId: string) => {
      setShowLoginModal(false);
      if (pendingAcceptOrder) {
        const updated = await assignOrderToDriver(pendingAcceptOrder.id, driverId);
        setLocalOrders(updated);
        toast({
          title: "¡Pedido Tomado con Éxito!",
          description: `El pedido #${pendingAcceptOrder.id} está en tu ruta.`,
        });
        setPendingAcceptOrder(null);
      }
    },
    [pendingAcceptOrder, toast]
  );

  // Completar entrega y acreditar ganancia a cartera
  const handleCompleteDelivery = useCallback(
    async (orderId: string) => {
      if (isCompleting) return;
      setIsCompleting(true);

      // 1. Desaparecer inmediatamente de la ruta activa (UI reactiva instantánea)
      setLocalOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: "Delivered" as OrderStatus, updatedAt: new Date().toISOString() }
            : o
        )
      );

      try {
        // 2. Persistir en la base de datos PostgreSQL crm-libro-local y acreditar billetera
        const res = await completeOrderDelivery(orderId);
        setLocalOrders(res.updatedOrders);
        setWallet(res.wallet);

        toast({
          title: "¡Entrega Completada! 🛵🎉",
          description: `Ganancia acreditada a tu Cartera. Total acumulado: $${res.wallet.balance.toLocaleString(
            "es-AR"
          )}`,
        });
      } catch (err: any) {
        console.warn("Aviso al completar entrega:", err);
      } finally {
        setIsCompleting(false);
      }
    },
    [isCompleting, toast]
  );

  return {
    availableOrders,
    myActiveOrders,
    handleTakeOrder,
    handleCompleteDelivery,
    pendingAcceptOrder,
    showLoginModal,
    setShowLoginModal,
    confirmOrderAfterLogin,
    wallet,
  };
}
