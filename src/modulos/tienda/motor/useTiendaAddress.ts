"use client";

import { useEffect, useState } from "react";
import type { DeliveryCoordinates } from "./tipos";
import {
  loadClientProfile,
  type ClientProfile,
} from "../../repartidor/motor/driverService";

export const PLACEHOLDER_DELIVERY_ADDRESSES = new Set([
  "bv orono 1200 rosario",
  "tucuman 2130 rosario",
]);

export function normalizeDeliveryAddress(address: string) {
  return address
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function isValidDeliveryAddress(address?: string | null): address is string {
  return Boolean(
    address?.trim() &&
      !PLACEHOLDER_DELIVERY_ADDRESSES.has(normalizeDeliveryAddress(address))
  );
}

export function readSavedDeliveryCoordinates(): DeliveryCoordinates | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("repartofacil_delivery_coordinates");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.address === "string" &&
      isValidDeliveryAddress(parsed.address) &&
      Number.isFinite(parsed.lat) &&
      Number.isFinite(parsed.lng) &&
      Math.abs(parsed.lat) <= 90 &&
      Math.abs(parsed.lng) <= 180
    ) {
      return parsed;
    }
  } catch (error) {
    console.warn("No se pudieron cargar las coordenadas de entrega:", error);
  }
  return null;
}

interface UseTiendaAddressOptions {
  onAddressUpdatedForCheckout?: () => void;
}

export function useTiendaAddress(options?: UseTiendaAddressOptions) {
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCoordinates, setDeliveryCoordinates] =
    useState<DeliveryCoordinates | null>(null);

  useEffect(() => {
    const client = loadClientProfile();
    setClientProfile(client);
    const savedCoordinates = readSavedDeliveryCoordinates();
    const savedAddress = localStorage.getItem("repartofacil_delivery_address");
    const activeAddress =
      savedCoordinates?.address ||
      (isValidDeliveryAddress(savedAddress) ? savedAddress : "") ||
      (isValidDeliveryAddress(client?.address) ? client.address : "");
    const activeCoordinates =
      savedCoordinates?.lat && savedCoordinates?.lng ? savedCoordinates : null;
    setDeliveryAddress(activeAddress);
    setDeliveryCoordinates(activeCoordinates);

    const syncAuth = () => {
      const c = loadClientProfile();
      setClientProfile(c);
      const currentCoordinates = readSavedDeliveryCoordinates();
      const currentAddress =
        currentCoordinates?.address ||
        (isValidDeliveryAddress(
          localStorage.getItem("repartofacil_delivery_address")
        )
          ? localStorage.getItem("repartofacil_delivery_address")!
          : isValidDeliveryAddress(c?.address)
          ? c.address
          : "");
      setDeliveryAddress(currentAddress);
      setDeliveryCoordinates(
        currentCoordinates?.lat && currentCoordinates?.lng
          ? currentCoordinates
          : null
      );
    };

    const syncClientProfileFromStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === "repartofacil_client_user" ||
        event.key === "repartofacil_client_token"
      ) {
        setClientProfile(loadClientProfile());
      }
    };

    window.addEventListener("repartofacil-auth", syncAuth);
    window.addEventListener("repartofacil-client-auth", syncAuth);
    window.addEventListener("storage", syncClientProfileFromStorage);
    return () => {
      window.removeEventListener("repartofacil-auth", syncAuth);
      window.removeEventListener("repartofacil-client-auth", syncAuth);
      window.removeEventListener("storage", syncClientProfileFromStorage);
    };
  }, []);

  const handleAddressChange = (
    newAddr: string,
    coordinates?: { lat: number; lng: number } | null
  ) => {
    const location = coordinates
      ? { address: newAddr, lat: coordinates.lat, lng: coordinates.lng }
      : { address: newAddr, lat: 0, lng: 0 };
    setDeliveryAddress(newAddr);
    setDeliveryCoordinates(coordinates ? location : null);
    localStorage.setItem("repartofacil_delivery_address", newAddr);
    if (coordinates) {
      localStorage.setItem(
        "repartofacil_delivery_coordinates",
        JSON.stringify(location)
      );
    }
    if (options?.onAddressUpdatedForCheckout) {
      options.onAddressUpdatedForCheckout();
    }
  };

  const syncAddressFromSavedCoordinates = () => {
    const savedCoordinates = readSavedDeliveryCoordinates();
    if (savedCoordinates) {
      setDeliveryAddress(savedCoordinates.address);
      setDeliveryCoordinates(savedCoordinates);
    }
  };

  return {
    clientProfile,
    setClientProfile,
    deliveryAddress,
    deliveryCoordinates,
    setDeliveryAddress,
    setDeliveryCoordinates,
    handleAddressChange,
    syncAddressFromSavedCoordinates,
  };
}
