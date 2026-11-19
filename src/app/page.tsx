"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { EcommerceStore } from "@/components/ecommerce/EcommerceStore"
import { DriverDashboard } from "@/components/dashboard/DriverDashboard"

function AppContent() {
  const searchParams = useSearchParams()
  const initialMode = searchParams.get("mode") === "driver" ? "driver" : "store"
  const [viewMode, setViewMode] = useState<"store" | "driver">(initialMode)

  useEffect(() => {
    const qMode = searchParams.get("mode")
    if (qMode === "driver" || qMode === "store") {
      setViewMode(qMode)
    }
  }, [searchParams])

  if (viewMode === "driver") {
    return <DriverDashboard onSwitchToStore={() => setViewMode("store")} />
  }

  return <EcommerceStore onSwitchToDriver={() => setViewMode("driver")} />
}

export default function MainPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">Cargando Reparto Fácil...</div>}>
      <AppContent />
    </Suspense>
  )
}
