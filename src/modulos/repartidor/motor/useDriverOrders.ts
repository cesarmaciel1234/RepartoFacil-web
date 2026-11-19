"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DriverOrder, OrderStatus, DriverWallet } from "./tipos";
import {
  loadLocalOrders,
  assignOrderToDriver,
  completeOrderDelivery,
  DEFAULT_AVAILABLE_ORDERS,
} from "./driverService";
import { loadDriverWallet } from "./walletService";
import { useFirestore } from "@/firebase";
import { collection, query, where, limit } from "@/firebase/local-firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useToast } from "@/hooks/use-toast";

export function useDriverOrders(currentDriverId?: string | null) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [localOrders, setLocalOrders] = useState<DriverOrder[]>(DEFAULT_AVAILABLE_ORDERS);
  const [pendingAcceptOrder, setPendingAcceptOrder] = useState<DriverOrder | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [wallet, setWallet] = useState<DriverWallet>(loadDriverWallet());

  // Cargar órdenes y wallet locales iniciales
  useEffect(() => {
    setLocalOrders(loadLocalOrders());
    setWallet(loadDriverWallet());

    const handleOrdersUpdated = () => {
      setLocalOrders(loadLocalOrders());
    };
    const handleWalletUpdated = (e: any) => {
      if (e.detail) setWallet(e.detail);
      else setWallet(loadDriverWallet());
    };

    window.addEventListener("rf-orders-updated", handleOrdersUpdated);
    window.addEventListener("rf-wallet-updated", handleWalletUpdated);
    return () => {
      window.removeEventListener("rf-orders-updated", handleOrdersUpdated);
      window.removeEventListener("rf-wallet-updated", handleWalletUpdated);
    };
  }, []);

  // Consulta en Firestore de pedidos pendientes
  const pendingOrdersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "orders"), where("status", "==", "Pending"), limit(25));
  }, [firestore]);
  const { data: firestorePendingOrders } = useCollection(pendingOrdersQuery);

  // Consulta en Firestore de pedidos tomados por este repartidor
  const driverOrdersQuery = useMemo(() => {
    if (!firestore || !currentDriverId) return null;
    return query(
      collection(firestore, "orders"),
      where("driverId", "==", currentDriverId),
      where("status", "in", ["Assigned", "Picked Up", "In Transit"])
    );
  }, [firestore, currentDriverId]);
  const { data: firestoreDriverOrders } = useCollection(driverOrdersQuery);

  // Pedidos Disponibles combinados (Firestore + Local)
  const availableOrders = useMemo(() => {
    const list: DriverOrder[] = [...(firestorePendingOrders || [])];
    const localPending = localOrders.filter((o) => o.status === "Pending");

    localPending.forEach((loc) => {
      if (!list.some((item) => item.id === loc.id)) {
        list.push(loc);
      }
    });

    return list.length > 0 ? list : DEFAULT_AVAILABLE_ORDERS;
  }, [firestorePendingOrders, localOrders]);

  // Mis pedidos activos en ruta
  const myActiveOrders = useMemo(() => {
    const list: DriverOrder[] = [...(firestoreDriverOrders || [])];
    const localActive = localOrders.filter(
      (o) =>
        (o.status === "Assigned" || o.status === "Picked Up" || o.status === "In Transit") &&
        (!currentDriverId || o.driverId === currentDriverId)
    );

    localActive.forEach((loc) => {
      if (!list.some((item) => item.id === loc.id)) {
        list.push(loc);
      }
    });

    return list;
  }, [firestoreDriverOrders, localOrders, currentDriverId]);

  // Aceptar pedido: requiere login solo si no está identificado
  const handleTakeOrder = useCallback(
    (order: DriverOrder, driverId?: string | null) => {
      if (!driverId) {
        setPendingAcceptOrder(order);
        setShowLoginModal(true);
        return;
      }

      assignOrderToDriver(order.id, driverId, firestore).then((updated) => {
        setLocalOrders(updated);
        toast({
          title: "¡Pedido Asignado!",
          description: `El pedido #${order.id} fue agregado a tu ruta activa.`,
        });
      });
    },
    [firestore, toast]
  );

  // Confirmar pedido tras loguearse
  const confirmOrderAfterLogin = useCallback(
    (driverId: string) => {
      setShowLoginModal(false);
      if (pendingAcceptOrder) {
        assignOrderToDriver(pendingAcceptOrder.id, driverId, firestore).then((updated) => {
          setLocalOrders(updated);
          toast({
            title: "¡Pedido Tomado con Éxito!",
            description: `El pedido #${pendingAcceptOrder.id} está en tu ruta.`,
          });
          setPendingAcceptOrder(null);
        });
      }
    },
    [pendingAcceptOrder, firestore, toast]
  );

  // Completar entrega y acreditar ganancia a cartera
  const handleCompleteDelivery = useCallback(
    async (orderId: string) => {
      const res = await completeOrderDelivery(orderId, firestore);
      setLocalOrders(res.updatedOrders);
      setWallet(res.wallet);
      toast({
        title: "¡Entrega Completada! 🛵🎉",
        description: `Ganancia acreditada a tu Cartera. Total acumulado: $${res.wallet.balance.toLocaleString("es-AR")}`,
      });
    },
    [firestore, toast]
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
