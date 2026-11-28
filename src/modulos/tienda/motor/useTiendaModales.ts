"use client";

import { useState } from "react";
import type { OrderData } from "./tipos";

/**
 * Hook modular para aislar y centralizar el estado de los modales y sheets
 * de la Tienda de Reparto Fácil (Carrito, Checkout, Dirección, Auth, Hub de Pedidos, Chat).
 * Cumple con la Regla 1 (Cerebro vs Cara) y Regla 2 (Límite de líneas).
 */
export function useTiendaModales() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCartCompanyId, setActiveCartCompanyId] = useState<string | null>(null);
  const [checkoutCompanyId, setCheckoutCompanyId] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isClientAuthOpen, setIsClientAuthOpen] = useState(false);
  const [isDriverAuthOpen, setIsDriverAuthOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isOrdersHubOpen, setIsOrdersHubOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isOrderChatOpen, setIsOrderChatOpen] = useState(false);
  const [selectedChatOrder, setSelectedChatOrder] = useState<any>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<OrderData | null>(null);

  const openCart = (companyId?: string) => {
    if (companyId) setActiveCartCompanyId(companyId);
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const openCheckout = (companyId: string) => {
    setCheckoutCompanyId(companyId);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const openAddressPicker = () => {
    setIsCheckoutOpen(false);
    setIsAddressModalOpen(true);
  };

  const openOrderChat = (order: any) => {
    setSelectedChatOrder(order);
    setIsOrderChatOpen(true);
  };

  const openOrdersHub = (orderId?: string) => {
    if (orderId) setActiveOrderId(orderId);
    setIsOrdersHubOpen(true);
  };

  return {
    isCartOpen,
    setIsCartOpen,
    activeCartCompanyId,
    setActiveCartCompanyId,
    checkoutCompanyId,
    setCheckoutCompanyId,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isClientAuthOpen,
    setIsClientAuthOpen,
    isDriverAuthOpen,
    setIsDriverAuthOpen,
    isAddressModalOpen,
    setIsAddressModalOpen,
    isOrdersHubOpen,
    setIsOrdersHubOpen,
    isMessagesOpen,
    setIsMessagesOpen,
    activeOrderId,
    setActiveOrderId,
    isOrderChatOpen,
    setIsOrderChatOpen,
    selectedChatOrder,
    setSelectedChatOrder,
    orderConfirmed,
    setOrderConfirmed,
    // Helpers
    openCart,
    closeCart,
    openCheckout,
    closeCheckout,
    openAddressPicker,
    openOrderChat,
    openOrdersHub,
  };
}
