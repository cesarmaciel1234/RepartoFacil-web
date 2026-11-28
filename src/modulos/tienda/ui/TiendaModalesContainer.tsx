"use client";

import React from "react";
import type { CheckoutFormData, DeliveryCoordinates, OrderData } from "../motor/tipos";
import type { ClientProfile } from "../../repartidor/motor/driverService";
import { DrawerCarrito, type CompanyCartSummary } from "./DrawerCarrito";
import { ModalCheckout } from "./ModalCheckout";
import { ModalCambiarDireccion } from "./ModalCambiarDireccion";
import { ModalClientAuth } from "./ModalClientAuth";
import { ModalDriverAuth } from "../../repartidor/ui/ModalDriverAuth";
import { CentroPedidosClienteSheet } from "./CentroPedidosClienteSheet";
import { MensajesClienteSheet } from "./MensajesClienteSheet";
import { OrderChatSheet } from "../../repartidor/ui/OrderChatSheet";

interface TiendaModalesContainerProps {
  // Drawer Carrito
  isCartOpen: boolean;
  onCartOpenChange: (open: boolean) => void;
  companyCarts: CompanyCartSummary[];
  activeCartCompanyId: string | null;
  inventoryReady: boolean;
  deliveryAddress: string;
  deliveryCoordinates: DeliveryCoordinates | null;
  onSelectCompanyCart: (id: string | null) => void;
  onUpdateDrawerQuantity: (productId: string, delta: number, companyId: string) => void;
  onRemoveDrawerItem: (productId: string, companyId: string) => void;
  onClearCompanyCart: (companyId: string) => void;
  onProceedToPayment: (companyId: string) => void;
  onContinueShopping: (companyId: string) => void;

  // Checkout
  isCheckoutOpen: boolean;
  onCheckoutOpenChange: (open: boolean) => void;
  checkoutCartTotal: number;
  checkoutCompanyId: string | null;
  clientProfile: ClientProfile | null;
  isSubmittingOrder: boolean;
  onConfirmOrder: (formData: CheckoutFormData, expectedClientId: string | null) => Promise<void>;
  onOpenLoginFromCheckout: () => void;
  onOpenAddressPickerFromCheckout: () => void;
  orderConfirmed: OrderData | null;
  onCloseConfirmed: () => void;

  // Modales
  isAddressModalOpen: boolean;
  onAddressModalOpenChange: (open: boolean) => void;
  onSelectAddress: (newAddress: string, coordinates: { lat: number; lng: number }) => void;

  isClientAuthOpen: boolean;
  onClientAuthOpenChange: (open: boolean) => void;
  onClientAuthSuccess: () => void;

  isDriverAuthOpen: boolean;
  onDriverAuthOpenChange: (open: boolean) => void;
  onDriverAuthSuccess: () => void;

  isOrdersHubOpen: boolean;
  onOrdersHubOpenChange: (open: boolean) => void;
  clientOrdersList: any[];
  ordersCached: boolean;
  ordersSavedAt: string | null;
  activeOrderId: string | null;

  isMessagesOpen: boolean;
  onMessagesOpenChange: (open: boolean) => void;
  unread: Record<string, number>;
  unreadError: boolean;

  isOrderChatOpen: boolean;
  onOrderChatOpenChange: (open: boolean) => void;
  selectedChatOrder: any;
  onBackToOrdersHubFromChat: () => void;
}

export function TiendaModalesContainer(props: TiendaModalesContainerProps) {
  const activeCheckoutCart = props.companyCarts.find(
    (c) => c.companyId === props.checkoutCompanyId
  );

  return (
    <>
      {/* ─── Drawer Lateral del Carrito ─── */}
      <DrawerCarrito
        isOpen={props.isCartOpen}
        onOpenChange={props.onCartOpenChange}
        companyCarts={props.companyCarts}
        activeCompanyCartId={props.activeCartCompanyId}
        inventoryReady={props.inventoryReady}
        deliveryType="delivery"
        deliveryAddress={props.deliveryAddress}
        deliveryCoordinates={props.deliveryCoordinates}
        onSelectCompanyCart={props.onSelectCompanyCart}
        onUpdateQuantity={props.onUpdateDrawerQuantity}
        onRemoveItem={props.onRemoveDrawerItem}
        onClearCompanyCart={props.onClearCompanyCart}
        onRemoveCompanyCart={props.onClearCompanyCart}
        onProceedToPayment={props.onProceedToPayment}
        onContinueShopping={props.onContinueShopping}
      />

      {/* ─── Modal de Checkout y Pago ─── */}
      <ModalCheckout
        isOpen={props.isCheckoutOpen}
        onOpenChange={props.onCheckoutOpenChange}
        cartTotal={props.checkoutCartTotal}
        companyName={activeCheckoutCart?.companyName}
        companyDeliveryFee={activeCheckoutCart?.company?.deliveryFee}
        freeDeliveryThreshold={activeCheckoutCart?.company?.freeDeliveryThreshold}
        companyPhone={activeCheckoutCart?.company?.phone}
        sucursalPhone={activeCheckoutCart?.company?.phone}
        profileAddress={props.clientProfile?.address || undefined}
        selectedDeliveryAddress={props.deliveryAddress}
        deliveryCoordinates={props.deliveryCoordinates}
        onOpenAddressPicker={props.onOpenAddressPickerFromCheckout}
        isSubmitting={props.isSubmittingOrder}
        onConfirmOrder={props.onConfirmOrder}
        onOpenLogin={props.onOpenLoginFromCheckout}
        orderConfirmed={props.orderConfirmed}
        onCloseConfirmed={props.onCloseConfirmed}
      />

      {/* ─── Modal para Editar / Cambiar Dirección de Entrega ─── */}
      <ModalCambiarDireccion
        isOpen={props.isAddressModalOpen}
        onOpenChange={props.onAddressModalOpenChange}
        currentAddress={props.deliveryAddress}
        onSelectAddress={props.onSelectAddress}
      />

      {/* ─── Modal de Autenticación de Cliente ─── */}
      <ModalClientAuth
        isOpen={props.isClientAuthOpen}
        onOpenChange={props.onClientAuthOpenChange}
        onSuccess={props.onClientAuthSuccess}
      />

      {/* ─── Modal de Autenticación de Repartidor ─── */}
      <ModalDriverAuth
        isOpen={props.isDriverAuthOpen}
        onOpenChange={props.onDriverAuthOpenChange}
        pendingOrder={null}
        onSuccess={props.onDriverAuthSuccess}
      />

      {/* ─── Centro de Pedidos en Curso (Hub Multitienda) ─── */}
      <CentroPedidosClienteSheet
        isOpen={props.isOrdersHubOpen}
        onOpenChange={props.onOrdersHubOpenChange}
        orders={props.clientOrdersList}
        ordersCached={props.ordersCached}
        ordersSavedAt={props.ordersSavedAt}
        initialOrderId={props.activeOrderId}
      />

      {/* ─── Bandeja de Mensajes del Cliente ─── */}
      <MensajesClienteSheet
        isOpen={props.isMessagesOpen}
        onOpenChange={props.onMessagesOpenChange}
        unread={props.unread}
        unreadError={props.unreadError}
      />

      {/* ─── Chat Tripartito Privado del Pedido Seleccionado ─── */}
      <OrderChatSheet
        isOpen={props.isOrderChatOpen}
        onOpenChange={props.onOrderChatOpenChange}
        activeOrder={props.selectedChatOrder || props.clientOrdersList[0] || null}
        viewerRole="client"
        deliveryAddress={props.deliveryAddress}
        onBackToOrdersHub={props.onBackToOrdersHubFromChat}
      />
    </>
  );
}
