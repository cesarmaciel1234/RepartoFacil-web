"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Target, Package, User, Truck, ShieldAlert, Layers, LogOut, Navigation, MapPin, MessageCircle, Send, X, ShieldCheck, Phone, Check, Loader2, Sparkles, Menu, Clock, AlertTriangle, Users, Store, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking, useAuth, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { doc, collection, query, where, orderBy, limit } from "@/firebase/local-firestore"
import { useToast } from "@/hooks/use-toast"
import { signOut } from "@/firebase/local-auth"
import { Progress } from "@/components/ui/progress"
import { driverCopilot } from "@/ai/flows/driver-copilot-flow"
import type { CopilotMessage } from "@/ai/schemas"
import { AdminOrderItem } from "@/components/dashboard/AdminOrderItem"
import { DriverOrderCard } from "@/components/dashboard/DriverOrderCard"
import { CoroItem } from "@/components/dashboard/CoroItem"
import { safeFormat } from "@/lib/date-utils"
import { LoginScreen } from "@/components/auth/LoginScreen"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500 font-mono text-xs">Cargando mapa...</div>
})

interface DriverDashboardProps {
  onSwitchToStore: () => void;
}

export function DriverDashboard({ onSwitchToStore }: DriverDashboardProps) {
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const firestore = useFirestore()
  const { toast } = useToast()

  const [isExpanded, setIsExpanded] = useState(false)
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)

  const [currentCoords, setCurrentCoords] = useState<{lat: number, lng: number} | null>(null)
  const [heading, setHeading] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)
  const [mapCenterTrigger, setMapCenterTrigger] = useState(0)

  const [activeTab, setActiveTab] = useState("pedidos") // Start on available orders for easy browsing
  const [pendingLoginOrder, setPendingLoginOrder] = useState<any | null>(null)
  const [showDriverLoginModal, setShowDriverLoginModal] = useState(false)

  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false)
  const [copilotMessage, setCopilotMessage] = useState("")
  const [copilotConversation, setCopilotConversation] = useState<CopilotMessage[]>([
    { role: 'model', content: "¡Hola! Soy Copo, tu copiloto de IA. ¿En qué puedo ayudarte hoy?" }
  ])
  const [isCopoThinking, setIsCopoThinking] = useState(false)
  const copilotScrollRef = useRef<HTMLDivElement>(null)

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null
    return doc(firestore, "users", user.uid)
  }, [firestore, user?.uid])
  const { data: userData } = useDoc(userDocRef)
  const isAdmin = userData?.role === 'Admin'

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude }
          setCurrentCoords(coords)
          if (position.coords.heading !== null) setHeading(position.coords.heading)

          if (!isUserLoading && user?.uid && firestore) {
            const dRef = doc(firestore, "driverProfiles", user.uid)
            setDocumentNonBlocking(dRef, {
              currentLatitude: coords.lat,
              currentLongitude: coords.lng,
              lastLocationUpdate: new Date().toISOString()
            }, { merge: true })
          }
        },
        (error) => console.error("GPS Tracking Error:", error),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      )
      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [isUserLoading, user?.uid, firestore])

  const fleetQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null
    return query(collection(firestore, "driverProfiles"), limit(50))
  }, [firestore, isAdmin])
  const { data: fleetData } = useCollection(fleetQuery)

  const bizOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !isAdmin) return null
    return query(collection(firestore, "orders"), where("companyId", "==", user.uid))
  }, [firestore, user?.uid, isAdmin])
  const { data: bizAllOrders } = useCollection(bizOrdersQuery)

  const driverOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || isAdmin) return null
    return query(collection(firestore, "orders"), where("driverId", "==", user.uid), where("status", "in", ["Assigned", "Picked Up", "In Transit"]))
  }, [firestore, user?.uid, isAdmin])
  const { data: driverActiveOrders } = useCollection(driverOrdersQuery)

  // Everyone can see pending orders freely!
  const pendingOrdersQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return query(collection(firestore, "orders"), where("status", "==", "Pending"), limit(25))
  }, [firestore])
  const { data: firestorePendingOrders } = useCollection(pendingOrdersQuery)

  // Also include localStorage orders
  const [localPendingOrders, setLocalPendingOrders] = useState<any[]>([])
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("rf_orders_history") || "[]")
      const pending = stored.filter((o: any) => o.status === "Pending")
      setLocalPendingOrders(pending)
    } catch {}
  }, [])

  const combinedPendingOrders = useMemo(() => {
    const list = [...(firestorePendingOrders || [])]
    localPendingOrders.forEach(loc => {
      if (!list.some(item => item.id === loc.id)) {
        list.push(loc)
      }
    })
    return list
  }, [firestorePendingOrders, localPendingOrders])

  const alertsQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return query(collection(firestore, "alerts"), orderBy("updatedAt", "desc"), limit(20))
  }, [firestore])
  const { data: alerts } = useCollection(alertsQuery)

  const handleDragStart = (clientY: number) => {
    setIsDragging(true)
    startY.current = clientY
  }

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return
    const delta = clientY - startY.current
    setDragY(delta)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    if (dragY < -80) {
      setIsExpanded(true)
    } else if (dragY > 80) {
      setIsExpanded(false)
      setIsMapFullscreen(false)
    }
    setDragY(0)
  }

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => { if (isDragging) handleDragMove(e.touches[0].clientY) }
    const handleTouchEnd = () => { if (isDragging) handleDragEnd() }
    const handleMouseMove = (e: MouseEvent) => { if (isDragging) handleDragMove(e.clientY) }
    const handleMouseUp = () => { if (isDragging) handleDragEnd() }

    if (isDragging) {
      window.addEventListener("touchmove", handleTouchMove)
      window.addEventListener("touchend", handleTouchEnd)
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }
    return () => {
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragY])

  // Handle Taking an Order: Requires Driver Login!
  const handleTakeOrder = (order: any) => {
    if (!user) {
      setPendingLoginOrder(order)
      setShowDriverLoginModal(true)
      return
    }

    // If user is logged in, assign the order
    executeAssignOrder(order, user.uid)
  }

  const executeAssignOrder = (order: any, driverId: string) => {
    if (firestore) {
      try {
        updateDocumentNonBlocking(doc(firestore, "orders", order.id), {
          driverId,
          status: "Assigned",
          updatedAt: new Date().toISOString()
        })
      } catch (e) {
        console.warn("Error updating order in firestore", e)
      }
    }

    // Update in localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("rf_orders_history") || "[]")
      const updated = stored.map((o: any) => o.id === order.id ? { ...o, driverId, status: "Assigned" } : o)
      localStorage.setItem("rf_orders_history", JSON.stringify(updated))
      setLocalPendingOrders(prev => prev.filter(o => o.id !== order.id))
    } catch {}

    toast({
      title: "¡Pedido Tomado!",
      description: `El pedido #${order.id} fue asignado a tu ruta.`,
    })
    setActiveTab("ruta")
    setIsExpanded(true)
  }

  const hasActiveSOS = alerts?.some(a => a.type === 'sos')
  const sheetY = isMapFullscreen ? 'calc(100% - 40px)' : isExpanded ? Math.max(0, dragY) : `calc(100% - 160px + ${Math.min(0, dragY)}px)`

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* ─── Mapa Interactivo Fondo ─── */}
      <div className="absolute inset-0 z-0">
        <InteractiveMap 
          center={currentCoords ? [currentCoords.lat, currentCoords.lng] : [-34.6037, -58.3816]} 
          alerts={alerts}
          activeOrders={isAdmin ? bizAllOrders : null}
          fleet={fleetData}
          isNavigating={isNavigating}
          centerTrigger={mapCenterTrigger}
          currentUserId={user?.uid}
        />
      </div>

      {/* ─── Top Bar: Botón Volver a Tienda + Menú Perfil ─── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Botón Volver a la Tienda */}
          <Button
            onClick={onSwitchToStore}
            className="h-12 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white shadow-xl border border-slate-700/80 font-black text-xs flex items-center gap-2 active:scale-95 transition-all backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Volver a la Tienda</span>
          </Button>

          {/* Menú Sidebar */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" className="h-12 w-12 rounded-2xl bg-slate-900/90 text-white hover:bg-slate-800 shadow-xl border border-slate-700/80 backdrop-blur-md">
                <Menu className="w-5 h-5 text-slate-200" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-0 border-none bg-slate-900/95 backdrop-blur-xl shadow-2xl text-slate-100 rounded-r-[40px]">
              <div className="p-6 space-y-6 h-full flex flex-col">
                <SheetHeader className="text-left">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-16 h-16 shadow-xl border-2 border-slate-700">
                      <AvatarImage src={user?.photoURL || ""} />
                      <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-black">
                        {userData?.firstName?.substring(0,2) || "RP"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <SheetTitle className="text-xl font-black text-white tracking-tight">
                        {userData?.firstName || (user ? "Repartidor" : "Modo Libre")}
                      </SheetTitle>
                      <p className="text-xs font-bold text-slate-400 truncate">
                        {user ? `ID: ${user.uid.substring(0,8)}` : "Sin iniciar sesión"}
                      </p>
                    </div>
                  </div>
                </SheetHeader>
                
                <div className="flex-1 space-y-2 pt-2">
                  <button onClick={onSwitchToStore} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-800 transition-colors text-left text-sm font-bold text-slate-200">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span>Tienda / Catálogo</span>
                  </button>

                  <Link href="/orders" className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-800 transition-colors text-sm font-bold text-slate-200">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-blue-400" />
                    </div>
                    <span>Mis Entregas</span>
                  </Link>

                  <Link href="/profile" className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-800 transition-colors text-sm font-bold text-slate-200">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-teal-400" />
                    </div>
                    <span>Mi Perfil</span>
                  </Link>
                </div>

                {user ? (
                  <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full justify-start gap-3 h-14 rounded-2xl text-rose-400 font-black px-4 hover:bg-rose-500/10 text-xs">
                    <LogOut className="w-4 h-4" /> Cerrar sesión
                  </Button>
                ) : (
                  <Button onClick={() => setShowDriverLoginModal(true)} className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs">
                    Iniciar sesión de Repartidor
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Badge Indicador Modo Repartidor */}
        <div className="pointer-events-auto">
          <Badge className="bg-slate-900/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-md font-black text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MODO REPARTIDOR</span>
          </Badge>
        </div>
      </div>

      {/* ─── Botones Flotantes Laterales del Mapa ─── */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 flex flex-col gap-3">
        <Button size="icon" onClick={() => setIsNavigating(!isNavigating)} className={cn("h-12 w-12 rounded-2xl shadow-xl transition-all active:scale-90 border border-slate-700/80 backdrop-blur-md", isNavigating ? "bg-emerald-500 text-white" : "bg-slate-900/90 text-slate-200")}>
          <Navigation className="w-5 h-5" />
        </Button>
        <Button size="icon" onClick={() => setMapCenterTrigger(p => p+1)} className="h-12 w-12 rounded-2xl shadow-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 active:scale-90 backdrop-blur-md">
          <Target className="w-5 h-5" />
        </Button>
        <Popover open={isAiAssistantOpen} onOpenChange={setIsAiAssistantOpen}>
          <PopoverTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-2xl shadow-xl active:scale-90 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30">
              <Sparkles className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="left" align="center" className="w-[340px] max-w-[90vw] rounded-[32px] p-0 mr-4 border border-slate-800 shadow-2xl bg-slate-900 text-slate-100">
            <div className="p-4 flex flex-col max-h-[70vh]">
              <header className="px-2 flex justify-between items-center mb-3">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white">Copiloto IA</h2>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">ASISTENCIA EN RUTA</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => setIsAiAssistantOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </header>
              <div ref={copilotScrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide min-h-[180px]">
                {copilotConversation.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn("max-w-[85%] p-3.5 rounded-2xl text-xs", msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700/60')}>
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-3 items-center">
                <Input placeholder="Preguntar a Copiloto..." className="h-10 bg-slate-800 border-slate-700 text-white rounded-xl px-4 text-xs" value={copilotMessage} onChange={(e) => setCopilotMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setCopilotMessage("")} />
                <Button size="icon" className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* ─── Sliding Bottom Panel (Pestañas Ruta / Pedidos Disponibles / Alertas) ─── */}
      <div className={cn("absolute left-0 right-0 bottom-0 z-40 transform will-change-transform", !isDragging && "transition-transform duration-500")} style={{ transform: `translateY(${sheetY})` }}>
        <div className="h-[85vh] w-full max-w-md mx-auto bg-slate-900/95 backdrop-blur-2xl rounded-t-[48px] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] flex flex-col relative border-t border-slate-800">
          {/* Drag Handle & Selector de Pestañas */}
          <div className="w-full flex flex-col items-center pt-5 pb-3 cursor-grab active:cursor-grabbing touch-none" onMouseDown={(e) => handleDragStart(e.clientY)} onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}>
            <div className={cn("w-14 h-1.5 rounded-full mb-5", hasActiveSOS ? "bg-red-500 animate-pulse" : "bg-slate-700")} />
            <div className="w-full px-6">
              <div className="flex bg-slate-800/90 rounded-2xl p-1 border border-slate-700/80">
                {[
                  { id: 'pedidos', icon: Layers, label: 'Disponibles', count: combinedPendingOrders.length },
                  { id: 'ruta', icon: Truck, label: 'Mi Ruta' },
                  { id: 'alerta', icon: ShieldAlert, label: 'Alertas' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={(e) => { e.stopPropagation(); setActiveTab(t.id); setIsExpanded(true); }}
                    className={cn(
                      "flex-1 h-11 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-black relative",
                      activeTab === t.id ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <t.icon className="w-4 h-4" />
                    <span>{t.label}</span>
                    {t.count !== undefined && t.count > 0 && (
                      <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full font-bold", activeTab === t.id ? "bg-slate-950 text-emerald-300" : "bg-emerald-500/20 text-emerald-400")}>
                        {t.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido Deslizable */}
          <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide text-left">
            {/* Pestaña: Pedidos Disponibles (Libre para ver, login al aceptar!) */}
            {activeTab === 'pedidos' && (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">Pedidos Disponibles</h2>
                    <p className="text-[11px] text-slate-400">Tocá en cualquier pedido para tomar la entrega</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">
                    {combinedPendingOrders.length} listos
                  </Badge>
                </div>

                {combinedPendingOrders.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800/40 rounded-3xl border border-slate-800">
                    <Package className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-xs font-bold text-slate-300">No hay pedidos pendientes en este momento</p>
                    <p className="text-[11px] text-slate-500 mt-1">Los pedidos nuevos que carguen los clientes en la tienda aparecerán acá al instante.</p>
                  </div>
                ) : (
                  combinedPendingOrders.map((order) => (
                    <div key={order.id} className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 shadow-md flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                            {order.deliveryType === 'pickup' ? '🏪 RETIRO EN LOCAL' : '🛵 ENVÍO A DOMICILIO'}
                          </span>
                          <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
                            ${order.total ? order.total.toLocaleString('es-AR') : (order.offeredPrice || '1.200')}
                          </h3>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                          #{order.id}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate font-semibold text-white">{order.deliveryAddress || 'Dirección de entrega'}</span>
                        </div>
                        {order.customerName && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span>Cliente: {order.customerName}</span>
                          </div>
                        )}
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                          {order.items.slice(0, 3).map((it: any, idx: number) => (
                            <div key={idx} className="flex justify-between">
                              <span className="truncate max-w-[200px]">{it.quantity}x {it.name}</span>
                              <span className="font-mono text-slate-300">${(it.price * it.quantity).toLocaleString('es-AR')}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-[10px] text-emerald-400 font-bold">+ {order.items.length - 3} cortes más...</p>
                          )}
                        </div>
                      )}

                      <Button
                        onClick={() => handleTakeOrder(order)}
                        className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aceptar Pedido</span>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pestaña: Mi Ruta Activa */}
            {activeTab === 'ruta' && (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-slate-800/90 rounded-3xl p-5 border border-slate-700/80">
                  <h3 className="text-lg font-black text-white tracking-tight">Mi Jornada</h3>
                  <p className="text-xs text-emerald-400 font-bold mt-1">
                    {driverActiveOrders?.length || 0} entregas en curso
                  </p>
                  <Progress value={user ? 70 : 0} className="h-1.5 mt-3 bg-slate-700" />
                </div>

                {!user ? (
                  <div className="text-center py-10 bg-slate-800/40 rounded-3xl border border-slate-800 p-4">
                    <User className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-xs font-bold text-slate-300">Modo Repartidor Abierto</p>
                    <p className="text-[11px] text-slate-500 mt-1 mb-3">Iniciá sesión para ver tus entregas asignadas o aceptá un pedido disponible.</p>
                    <Button onClick={() => setShowDriverLoginModal(true)} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-xl font-bold">
                      Identificarme como Repartidor
                    </Button>
                  </div>
                ) : (
                  driverActiveOrders?.map((order, i) => (
                    <DriverOrderCard key={order.id} order={order} index={i} currentCoords={currentCoords} onOpenChat={() => router.push(`/chat?orderId=${order.id}`)} />
                  ))
                )}
              </div>
            )}

            {/* Pestaña: Alertas y Comunidad */}
            {activeTab === 'alerta' && (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2">
                <h3 className="text-lg font-black text-white tracking-tight">Alertas de Tráfico & SOS</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "policia", label: "Control", icon: ShieldAlert, color: "text-blue-400" },
                    { id: "trafico", label: "Tráfico Lento", icon: Clock, color: "text-amber-400" },
                    { id: "accidente", label: "Accidente", icon: AlertTriangle, color: "text-rose-400" },
                    { id: "obras", label: "Obras", icon: Navigation, color: "text-emerald-400" },
                  ].map((a) => (
                    <Button
                      key={a.id}
                      variant="outline"
                      className="h-16 rounded-2xl flex flex-col gap-1 bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200 active:scale-95"
                      onClick={() => {
                        if (!user) {
                          setShowDriverLoginModal(true)
                          return
                        }
                        if (!currentCoords || !firestore) return
                        addDocumentNonBlocking(collection(firestore, "alerts"), {
                          type: a.id,
                          label: a.label,
                          latitude: currentCoords.lat,
                          longitude: currentCoords.lng,
                          authorId: user.uid,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        })
                        toast({ title: `Reporte de ${a.label} enviado` })
                      }}
                    >
                      <a.icon className={cn("w-4 h-4", a.color)} />
                      <span className="text-[10px] font-bold">{a.label}</span>
                    </Button>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  {alerts?.map((alert) => (
                    <CoroItem key={alert.id} alert={alert} userId={user?.uid || ""} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Modal de Login / Identificación de Repartidor (Solo se dispara al aceptar pedido o iniciar) ─── */}
      <Dialog open={showDriverLoginModal} onOpenChange={setShowDriverLoginModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm p-6 rounded-3xl">
          <DialogHeader className="text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
              <Truck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-black text-white">
              Identificación de Repartidor
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {pendingLoginOrder
                ? `Para aceptar el pedido #${pendingLoginOrder.id}, por favor ingresá tu nombre de repartidor.`
                : "Ingresá tu nombre para registrar tus entregas y sincronizar con la central."}
            </DialogDescription>
          </DialogHeader>

          <DriverQuickLogin
            onSuccess={(driverId) => {
              setShowDriverLoginModal(false)
              if (pendingLoginOrder) {
                executeAssignOrder(pendingLoginOrder, driverId)
                setPendingLoginOrder(null)
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DriverQuickLogin({ onSuccess }: { onSuccess: (driverId: string) => void }) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const auth = useAuth()
  const firestore = useFirestore()

  const handleStart = async () => {
    if (!name.trim()) {
      toast({ title: "Ingresá tu nombre", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      // Local driver ID
      const driverId = `driver-${Date.now().toString(36)}`
      const driverData = {
        uid: driverId,
        id: driverId,
        firstName: name.trim(),
        role: "Driver",
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem("repartofacil_user", JSON.stringify(driverData))
      window.dispatchEvent(new Event("repartofacil-auth"))

      if (firestore) {
        setDocumentNonBlocking(doc(firestore, "driverProfiles", driverId), {
          id: driverId,
          firstName: name.trim(),
          availabilityStatus: "Available",
          vehicleType: "Motorcycle",
          updatedAt: new Date().toISOString(),
        }, { merge: true })
      }

      onSuccess(driverId)
    } catch (e) {
      toast({ title: "Error al identificar", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <div>
        <label className="text-xs font-bold text-slate-300 block mb-1">Tu Nombre *</label>
        <Input
          placeholder="Ej. Lucas Motomensajero"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white rounded-xl text-xs h-10"
        />
      </div>

      <Button
        onClick={handleStart}
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black h-11 rounded-xl text-xs"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
        <span>Ingresar y Aceptar</span>
      </Button>
    </div>
  )
}
