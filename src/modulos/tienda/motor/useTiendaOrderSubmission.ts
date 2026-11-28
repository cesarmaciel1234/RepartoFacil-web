"use client";

import { useState } from "react";
import type { CompanyStore } from "@/data/mockCompanies";
import type { CartItem, CheckoutFormData } from "./tipos";
import {
  isProductPurchasable,
  productAvailabilityMessage,
} from "./productoDisponibilidad";
import {
  autoRegisterGuestCustomer,
  createOrder,
  refreshMissingCustomerProfile,
  saveMissingCustomerProfile,
} from "./pedidoService";
import {
  loadClientProfile,
  type ClientProfile,
} from "../../repartidor/motor/driverService";
import { authHeaders } from "@/lib/clientAuth";
import { useToast } from "@/hooks/use-toast";

interface UseTiendaOrderSubmissionProps {
  companies: CompanyStore[];
  catalogProductsStatus: string;
  checkoutCompanyId: string | null;
  checkoutCart: CartItem[];
  openCheckout: (companyId: string) => void;
  closeCheckout: () => void;
  setOrderConfirmed: (order: any) => void;
  clearCompanyCart: (companyId: string) => void;
  setClientProfile: (profile: ClientProfile | null) => void;
}

export function useTiendaOrderSubmission({
  companies,
  catalogProductsStatus,
  checkoutCompanyId,
  checkoutCart,
  openCheckout,
  closeCheckout,
  setOrderConfirmed,
  clearCompanyCart,
  setClientProfile,
}: UseTiendaOrderSubmissionProps) {
  const { toast } = useToast();
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const handleProceedToPayment = async (companyId: string) => {
    if (catalogProductsStatus !== "ready") {
      toast({
        title: "Inventario no disponible",
        description: "Espera a que Cobro Fácil confirme precio y stock.",
        variant: "destructive",
      });
      return;
    }
    openCheckout(companyId);
    const client = loadClientProfile();
    if (client && authHeaders("Client").Authorization) {
      try {
        await refreshMissingCustomerProfile();
      } catch (error) {
        console.warn("No se pudo refrescar perfil del comprador:", error);
      }
    }
  };

  const handleConfirmOrder = async (
    formData: CheckoutFormData,
    expectedClientId: string | null
  ) => {
    setIsSubmittingOrder(true);
    try {
      if (!checkoutCompanyId || checkoutCart.length === 0) {
        throw new Error("El carrito de este comercio está vacío.");
      }
      if (catalogProductsStatus !== "ready") {
        throw new Error(
          "No se pudo validar el inventario actual. Intenta nuevamente."
        );
      }
      const unavailableItem = checkoutCart.find(
        (item) =>
          !isProductPurchasable(item.product) ||
          item.quantity > item.product.stockKg
      );
      if (unavailableItem) {
        const reason =
          productAvailabilityMessage(unavailableItem.product) ||
          "la cantidad supera el stock informado por el TPV";
        throw new Error(
          `${unavailableItem.product.name}: ${reason}. Ajusta el carrito antes de continuar.`
        );
      }
      const orderCompany = companies.find(
        (company) =>
          company.id === checkoutCompanyId ||
          company.slug === checkoutCompanyId ||
          company.id === `empresa-${checkoutCompanyId}`
      );
      const companySlug =
        orderCompany?.slug || checkoutCompanyId.replace(/^empresa-/, "");
      const isTestCompany =
        checkoutCompanyId === "empresa-prueba" || companySlug === "prueba";
      const isMacielCompany =
        checkoutCompanyId === "frigorifico-maciel" || companySlug === "maciel";
      const orderForm: CheckoutFormData = {
        ...formData,
        companyId: orderCompany?.id || checkoutCompanyId,
        companySlug,
        empresaId:
          orderCompany?.empresa_id ||
          (isTestCompany ? 2 : isMacielCompany ? 1 : undefined),
        selectedBranch:
          orderCompany?.name ||
          checkoutCart[0]?.product.companyName ||
          formData.selectedBranch,
        deliveryFeeOverride: orderCompany?.deliveryFee,
        freeDeliveryThreshold: orderCompany?.freeDeliveryThreshold,
      };

      let activeClient = loadClientProfile();
      const authHeader = authHeaders("Client").Authorization;

      if (!activeClient || !authHeader) {
        activeClient = await autoRegisterGuestCustomer({
          name: orderForm.customerName,
          phone: orderForm.customerPhone,
          address: orderForm.deliveryAddress,
        });
        setClientProfile(activeClient);
      } else if (expectedClientId) {
        await saveMissingCustomerProfile(orderForm, expectedClientId);
        if (loadClientProfile()?.id !== expectedClientId) {
          throw new Error(
            "La sesión cambió. Cerrá el formulario y volvé a abrirlo."
          );
        }
      }

      const newOrder = await createOrder(checkoutCart, orderForm);
      closeCheckout();
      setOrderConfirmed(newOrder);
      clearCompanyCart(checkoutCompanyId);
    } catch (error) {
      console.error("No se pudo confirmar el pedido:", error);
      toast({
        title: "No se pudo registrar el pedido",
        description:
          error instanceof Error
            ? error.message
            : "Tu carrito sigue guardado. Intentá nuevamente más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return {
    isSubmittingOrder,
    handleProceedToPayment,
    handleConfirmOrder,
  };
}
