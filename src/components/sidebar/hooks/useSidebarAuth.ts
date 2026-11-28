import { useState, useEffect } from 'react';
import { DriverProfile } from '@/modulos/repartidor/motor/tipos';
import {
  loadClientProfile,
  ClientProfile,
  loadDriverProfile,
  clearDriverProfile,
  clearClientProfile,
} from '@/modulos/repartidor/motor/driverService';
import { authHeaders } from '@/lib/clientAuth';

export interface UseSidebarAuthParams {
  driverProfileProp?: DriverProfile | null;
  currentMode: 'store' | 'driver';
  onOpenChange: (open: boolean) => void;
  onSwitchMode: (mode: 'store' | 'driver') => void;
  onLogout?: () => void;
}

export function useSidebarAuth({
  driverProfileProp,
  currentMode,
  onOpenChange,
  onSwitchMode,
  onLogout,
}: UseSidebarAuthParams) {
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [driverProfileLocal, setDriverProfileLocal] = useState<DriverProfile | null>(
    driverProfileProp || null
  );
  const [isClientAuthOpen, setIsClientAuthOpen] = useState(false);

  const activeDriverProfile = driverProfileProp || driverProfileLocal;
  const isDriverMode = currentMode === 'driver';

  useEffect(() => {
    setClientProfile(loadClientProfile());
    setDriverProfileLocal(loadDriverProfile());

    const sync = () => {
      setClientProfile(loadClientProfile());
      setDriverProfileLocal(loadDriverProfile());
    };

    window.addEventListener('repartofacil-auth', sync);
    window.addEventListener('repartofacil-client-auth', sync);
    window.addEventListener('repartofacil-driver-auth', sync);
    return () => {
      window.removeEventListener('repartofacil-auth', sync);
      window.removeEventListener('repartofacil-client-auth', sync);
      window.removeEventListener('repartofacil-driver-auth', sync);
    };
  }, []);

  const userName =
    isDriverMode && activeDriverProfile
      ? activeDriverProfile.firstName
      : isDriverMode
      ? 'Repartidor (Sin sesión)'
      : clientProfile
      ? clientProfile.displayName
      : 'Cliente Reparto Fácil';

  const userInitial = userName.charAt(0).toUpperCase();

  const driverStatusLabel =
    activeDriverProfile?.availabilityStatus === 'Available'
      ? 'Disponible'
      : activeDriverProfile?.availabilityStatus === 'Busy'
      ? 'En reparto'
      : activeDriverProfile?.availabilityStatus === 'Offline'
      ? 'Desconectado'
      : activeDriverProfile
      ? 'Estado sin configurar'
      : 'Sin autenticar';

  const driverVehicleLabel =
    activeDriverProfile?.vehicleType === 'Motorcycle'
      ? 'Motocicleta'
      : activeDriverProfile?.vehicleType === 'Bicycle'
      ? 'Bicicleta'
      : activeDriverProfile?.vehicleType === 'Car'
      ? 'Auto'
      : 'Sin configurar';

  const driverIdLabel = activeDriverProfile?.id
    ? `#${activeDriverProfile.id.slice(-8).toUpperCase()}`
    : 'Sin asignar';

  const handleCloseSession = () => {
    onOpenChange(false);
    if (currentMode === 'driver') {
      if (driverProfileLocal?.id) {
        fetch('/api/orders/custodio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders('Driver') },
          body: JSON.stringify({
            action: 'driver_disconnected',
            driverId: driverProfileLocal.id,
            driverName: driverProfileLocal.firstName || 'Repartidor',
          }),
        })
          .then((response) => {
            if (!response.ok)
              console.warn('No se pudo registrar la desconexión del repartidor:', response.status);
          })
          .catch((error) => console.warn('No se pudo notificar la desconexión:', error));
      }
      clearDriverProfile();
      setDriverProfileLocal(null);
      if (onLogout) onLogout();
      onSwitchMode('store');
    } else {
      clearClientProfile();
      setClientProfile(null);
      if (onLogout) onLogout();
    }
  };

  const handleSwitchModeAndClose = () => {
    onOpenChange(false);
    onSwitchMode(currentMode === 'store' ? 'driver' : 'store');
  };

  const handlePwaCacheClear = async () => {
    if (typeof window !== 'undefined') {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      const url = new URL(window.location.href);
      url.searchParams.set('mode', currentMode);
      url.searchParams.set('v', String(Date.now()));
      window.location.href = url.toString();
    }
  };

  return {
    clientProfile,
    driverProfileLocal,
    activeDriverProfile,
    isClientAuthOpen,
    setIsClientAuthOpen,
    isDriverMode,
    userName,
    userInitial,
    driverStatusLabel,
    driverVehicleLabel,
    driverIdLabel,
    handleCloseSession,
    handleSwitchModeAndClose,
    handlePwaCacheClear,
  };
}
