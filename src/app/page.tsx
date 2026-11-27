"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { TiendaPiramidal } from "@/modulos/tienda/TiendaPiramidal"
import { RepartidorPiramidal } from "@/modulos/repartidor/RepartidorPiramidal"
import { loadDriverProfile } from "@/modulos/repartidor/motor/driverService"

function AppContent() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<"store" | "driver">("store")
  const [isReady, setIsReady] = useState(false)

  // Regla de arranque (prioridad de vista):
  // 1. Verificar primero si existe una sesión de Repartidor activa y válida: entrar directo al modo Repartidor.
  // 2. Si no existe sesión de Repartidor activa, arrancar siempre en modo Tienda/Comprador (Inicio).
  // 3. Nunca mostrar el modal de repartidor automáticamente si la sesión está cerrada o vencida.
  useEffect(() => {
    const activeDriver = loadDriverProfile()
    if (activeDriver) {
      setViewMode("driver")
    } else {
      setViewMode("store")
      if (searchParams.get("mode") === "driver" && typeof window !== "undefined") {
        const url = new URL(window.location.href)
        url.searchParams.delete("mode")
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""))
      }
    }
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) return
    const qMode = searchParams.get("mode")
    if (qMode === "driver") {
      const activeDriver = loadDriverProfile()
      if (activeDriver) {
        setViewMode("driver")
      } else {
        setViewMode("store")
      }
    } else if (qMode === "store") {
      setViewMode("store")
    }
  }, [searchParams, isReady])

  const handleSwitchToStore = () => {
    setViewMode("store")
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.delete("mode")
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""))
    }
  }

  const handleSwitchToDriver = () => {
    setViewMode("driver")
  }

  if (viewMode === "driver") {
    return <RepartidorPiramidal onSwitchToStore={handleSwitchToStore} />
  }

  return <TiendaPiramidal onSwitchToDriver={handleSwitchToDriver} />
}

export default function MainPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">Cargando Reparto Fácil...</div>}>
      <AppContent />
    </Suspense>
  )
}
