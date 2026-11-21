"use client";

import { useEffect, useMemo, useState } from "react";
import { getOrCreateActiveClientIdentity } from "../../../repartidor/motor/driverService";
import type { OrderData } from "../../motor/tipos";

interface UsePedidosClienteParams {
  selectedChatOrder: any;
  setSelectedChatOrder: (order: any) => void;
  orderConfirmed: OrderData | null;
}

export function usePedidosCliente({
  selectedChatOrder,
  setSelectedChatOrder,
  orderConfirmed,
}: UsePedidosClienteParams) {
  const [clientOrdersList, setClientOrdersList] = useState<any[]>([]);

  useEffect(() => {
    const syncOrders = async () => {
      const { clientId: activeClientId } = getOrCreateActiveClientIdentity();
      let combined: any[] = [];
      try {
        const raw = localStorage.getItem("rf_orders_history");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            combined = parsed.filter((order) => order.clientId === activeClientId);
          }
        }
      } catch (error) {
        console.warn("No se pudo leer el historial local de pedidos:", error);
      }

      try {
        const url = `/api/orders?cliente_id=${encodeURIComponent(activeClientId)}`;
        const response = await fetch(url, { cache: "no-store" });
        if (response.ok) {
          const cloudOrders = await response.json();
          if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
            const orderMap = new Map<string, any>();
            cloudOrders.forEach((order) => orderMap.set(order.id, order));
            combined.forEach((order) => {
              if (!orderMap.has(order.id)) orderMap.set(order.id, order);
            });
            combined = Array.from(orderMap.values());
          }
        } else {
          console.warn("No se pudo sincronizar el historial de pedidos:", response.status);
        }
      } catch (error) {
        console.warn("Error sincronizando el historial de pedidos:", error);
      }

      setClientOrdersList(combined);
      if (combined.length === 0) {
        setSelectedChatOrder(null);
      } else if (
        !selectedChatOrder ||
        !combined.some((order) => order.id === selectedChatOrder.id)
      ) {
        setSelectedChatOrder(combined[0]);
      }
    };

    syncOrders();
    const interval = setInterval(syncOrders, 4000);
    window.addEventListener("rf-orders-updated", syncOrders);
    window.addEventListener("repartofacil-client-auth", syncOrders);
    window.addEventListener("repartofacil-auth", syncOrders);
    window.addEventListener("storage", syncOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener("rf-orders-updated", syncOrders);
      window.removeEventListener("repartofacil-client-auth", syncOrders);
      window.removeEventListener("repartofacil-auth", syncOrders);
      window.removeEventListener("storage", syncOrders);
    };
  }, [selectedChatOrder, orderConfirmed, setSelectedChatOrder]);

  const activeOrdersCount = useMemo(
    () =>
      clientOrdersList.filter(
        (order) =>
          ![
            "delivered",
            "cancelled",
            "cancelled_by_client",
            "cancelled_timeout",
            "rejected",
          ].includes(String(order.status).toLowerCase())
      ).length,
    [clientOrdersList]
  );

  return { clientOrdersList, activeOrdersCount };
}
