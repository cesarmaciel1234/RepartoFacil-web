"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Product, CATEGORIES, INITIAL_PRODUCTS } from "@/data/mockProducts"
import { Search, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Check, X, MapPin, Phone, User, Clock, Sparkles, Truck, ShieldCheck, ChevronRight, Store, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase"
import { collection } from "@/firebase/local-firestore"

export interface CartItem {
  product: Product;
  quantity: number;
}

interface EcommerceStoreProps {
  onSwitchToDriver: () => void;
}

export function EcommerceStore({ onSwitchToDriver }: EcommerceStoreProps) {
  const { user } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()

  const [products] = useState<Product[]>(INITIAL_PRODUCTS)
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null)

  // Checkout form fields
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("Sucursal Maciel")
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia" | "tarjeta">("efectivo")
  const [orderNotes, setOrderNotes] = useState("")
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("rf_cart")
      if (savedCart) setCart(JSON.parse(savedCart))
      
      const savedUser = localStorage.getItem("rf_customer_data")
      if (savedUser) {
        const u = JSON.parse(savedUser)
        if (u.name) setCustomerName(u.name)
        if (u.phone) setCustomerPhone(u.phone)
        if (u.address) setDeliveryAddress(u.address)
      }
    } catch {}
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("rf_cart", JSON.stringify(cart))
    } catch {}
  }, [cart])

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === "todos" || p.category === selectedCategory
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCat && matchesSearch
    })
  }, [products, selectedCategory, searchQuery])

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id)
      if (exists) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    toast({
      title: "Agregado al carrito",
      description: `${product.name} fue añadido.`,
      duration: 1500,
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQ = item.quantity + delta
            return newQ > 0 ? { ...item, quantity: newQ } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  }, [cart])

  const cartItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0)
  }, [cart])

  const deliveryFee = deliveryType === "delivery" && cartTotal > 0 ? (cartTotal > 30000 ? 0 : 1500) : 0
  const finalTotal = cartTotal + deliveryFee

  // Handle Checkout
  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      toast({ title: "Tu carrito está vacío", variant: "destructive" })
      return
    }
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  const handleConfirmOrder = async () => {
    if (!customerName.trim()) {
      toast({ title: "Ingresá tu nombre y apellido", variant: "destructive" })
      return
    }
    if (!customerPhone.trim()) {
      toast({ title: "Ingresá tu WhatsApp o teléfono de contacto", variant: "destructive" })
      return
    }
    if (deliveryType === "delivery" && !deliveryAddress.trim()) {
      toast({ title: "Ingresá la dirección de entrega", variant: "destructive" })
      return
    }

    setIsSubmittingOrder(true)

    // Save customer data for next time
    localStorage.setItem(
      "rf_customer_data",
      JSON.stringify({
        name: customerName,
        phone: customerPhone,
        address: deliveryAddress,
      })
    )

    const orderId = `RF-${Math.floor(1000 + Math.random() * 9000)}`
    const orderData = {
      id: orderId,
      customerName,
      customerPhone,
      deliveryType,
      deliveryAddress: deliveryType === "delivery" ? deliveryAddress : selectedBranch,
      paymentMethod,
      notes: orderNotes,
      items: cart.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        unit: i.product.unit,
        quantity: i.quantity,
      })),
      subtotal: cartTotal,
      deliveryFee,
      total: finalTotal,
      status: "Pending", // Visible in Driver Dashboard!
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "RepartoFacil Web",
    }

    // Save to Firestore/local store if available
    try {
      if (firestore) {
        addDocumentNonBlocking(collection(firestore, "orders"), orderData)
      }
    } catch (e) {
      console.warn("Local order saved", e)
    }

    // Also persist in localStorage for pending orders tracking
    try {
      const existing = JSON.parse(localStorage.getItem("rf_orders_history") || "[]")
      existing.unshift(orderData)
      localStorage.setItem("rf_orders_history", JSON.stringify(existing))
    } catch {}

    setIsSubmittingOrder(false)
    setIsCheckoutOpen(false)
    setOrderConfirmed(orderData)
    clearCart()
  }

  const formatMoney = (val: number) => {
    return "$" + val.toLocaleString("es-AR")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-28">
      {/* ─── Top Header (Rappi / Uber Eats Style) ─── */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-3 sm:px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Marca */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-white text-base shadow-md shadow-emerald-500/20 shrink-0">
              RF
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-black text-base tracking-tight text-white truncate">Reparto Fácil</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-1 py-0 shrink-0">
                  MARKET
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 truncate">
                <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[220px]">
                  {deliveryType === "delivery" && deliveryAddress
                    ? deliveryAddress
                    : "Envíos y Retiros · Sucursales Maciel"}
                </span>
              </p>
            </div>
          </div>

          {/* Acciones Header */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Botón Modo Repartidor */}
            <Button
              onClick={onSwitchToDriver}
              variant="outline"
              size="sm"
              className="bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-200 font-bold text-xs rounded-xl h-9 px-2.5 sm:px-3 flex items-center gap-1 active:scale-95 transition-all"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Modo Repartidor</span>
              <span className="sm:hidden text-[11px]">Repartidor</span>
            </Button>

            {/* Botón Carrito */}
            <Button
              onClick={() => setIsCartOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl h-9 px-2.5 sm:px-3.5 flex items-center gap-1.5 shadow-md shadow-emerald-500/25 active:scale-95 transition-all relative shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="font-mono font-bold hidden sm:inline">
                {cartTotal > 0 ? formatMoney(cartTotal) : "Carrito"}
              </span>
              {cartItemsCount > 0 && (
                <span className="bg-white text-emerald-700 font-black text-[10px] w-4.5 h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center shrink-0">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda interactiva */}
        <div className="max-w-6xl mx-auto mt-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar asado, vacío, milanesas, pollo, combos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 bg-slate-800/80 border-slate-700/80 text-white placeholder:text-slate-400 rounded-xl h-11 text-sm focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Banner Promo (Tipo Rappi / Mercado Libre) ─── */}
      <section className="px-4 py-4 max-w-6xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/20 p-5 sm:p-7 shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-lg">
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black text-xs mb-2">
              🔥 DIRECTO DE FRIGORÍFICO
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-2">
              Cortes Seleccionados y Envíos en el Acto
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mb-4 line-clamp-2">
              Pedí tus cortes frescos sin moverte de casa. Conectado a la base de stock en tiempo real de Cobro Fácil.
            </p>
            <div className="flex items-center gap-3 text-[11px] font-bold text-emerald-300">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> Envíos en 35-50 min
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Calidad Garantizada
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categorías Chips Horizontales (Scrollable) ─── */}
      <section className="px-4 py-2 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all active:scale-95 ${
                  isSelected
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-100"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ─── Grilla de Productos ─── */}
      <main className="px-4 py-3 max-w-6xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>Catálogo Disponible</span>
            <Badge className="bg-slate-800 text-slate-400 border-none text-[10px] font-bold">
              {filteredProducts.length} productos
            </Badge>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">Precios en ARS</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800">
            <p className="text-3xl mb-2">🔍</p>
            <h3 className="text-sm font-bold text-slate-200 mb-1">No se encontraron productos</h3>
            <p className="text-xs text-slate-400 mb-4">Probá buscando con otro nombre o seleccioná otra categoría.</p>
            <Button
              onClick={() => {
                setSelectedCategory("todos")
                setSearchQuery("")
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Ver todos los cortes
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((p) => {
              const inCart = cart.find((i) => i.product.id === p.id)
              return (
                <div
                  key={p.id}
                  className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col hover:border-slate-700 transition-all group shadow-sm hover:shadow-xl"
                >
                  {/* Foto de producto */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {p.discountBadge && (
                      <Badge className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-lg border-none shadow-md">
                        {p.discountBadge}
                      </Badge>
                    )}
                    {p.isPopular && !p.discountBadge && (
                      <Badge className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-lg border-none shadow-md">
                        ★ Destacado
                      </Badge>
                    )}
                  </div>

                  {/* Detalle Producto */}
                  <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          {p.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">por {p.unit}</span>
                      </div>
                      <h3 className="font-black text-sm text-slate-100 tracking-tight leading-snug line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-base sm:text-lg font-black text-white tracking-tight">
                          {formatMoney(p.price)}
                        </span>
                      </div>

                      {inCart ? (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-0.5">
                          <button
                            onClick={() => updateQuantity(p.id, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-5 text-center font-black text-xs text-emerald-400">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(p.id, 1)}
                            className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center font-bold text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(p)}
                          size="sm"
                          className="h-8 px-2.5 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl font-bold text-xs active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Agregar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ─── Barra Flotante Inferior de Carrito (si hay items) ─── */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3.5 px-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-emerald-400/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-sm">
                {cartItemsCount}
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-100">Total acumulado</p>
                <p className="text-base font-black tracking-tight">{formatMoney(cartTotal)}</p>
              </div>
            </div>

            <Button
              onClick={() => setIsCartOpen(true)}
              className="bg-white hover:bg-slate-100 text-emerald-700 font-black text-xs rounded-xl h-10 px-4 shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Ver Carrito</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── Drawer Lateral de Carrito ─── */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-slate-900 border-slate-800 text-slate-100 p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-slate-800 text-left flex flex-row items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                Mi Carrito de Compras
              </SheetTitle>
              <p className="text-xs text-slate-400">
                {cartItemsCount} {cartItemsCount === 1 ? "artículo" : "artículos"} seleccionados
              </p>
            </div>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-2"
              >
                Vaciar
              </Button>
            )}
          </SheetHeader>

          {/* Lista de productos en carrito */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-400" />
                <p className="text-sm font-bold text-slate-300">Tu carrito está vacío</p>
                <p className="text-xs text-slate-500 mt-1">Explorá el catálogo y agregá los cortes que prefieras.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 flex items-center gap-3"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">{item.product.name}</h4>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">
                      {formatMoney(item.product.price * item.quantity)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.quantity} x {formatMoney(item.product.price)} /{item.product.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl p-0.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center font-bold text-xs text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center font-bold text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Resumen y Botón Pagar */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal productos:</span>
                  <span className="font-bold font-mono">{formatMoney(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tipo de entrega:</span>
                  <span className="font-bold text-emerald-400">
                    {deliveryType === "delivery" ? "Envío a Domicilio" : "Retiro en Local"}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black text-white">
                  <span>Total estimado:</span>
                  <span className="text-emerald-400 font-mono text-base">{formatMoney(finalTotal)}</span>
                </div>
              </div>

              <Button
                onClick={handleProceedToPayment}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black h-12 rounded-xl text-sm shadow-xl shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Continuar al Pago</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── Modal de Checkout / Datos de Entrega y Logueo ─── */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-lg p-6 rounded-3xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Confirmar Pedido & Datos de Entrega
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Completá tus datos para coordinar el despacho. No requiere contraseñas complejas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Opciones de entrega */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">¿Cómo querés recibirlo?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType("delivery")}
                  className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                    deliveryType === "delivery"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "bg-slate-800/60 border-slate-700 text-slate-300"
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Envío a Domicilio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType("pickup")}
                  className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                    deliveryType === "pickup"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "bg-slate-800/60 border-slate-700 text-slate-300"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Retiro en Sucursal</span>
                </button>
              </div>
            </div>

            {/* Datos de contacto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre y Apellido *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Ej. Juan Pérez"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-700 text-white rounded-xl text-xs h-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">WhatsApp / Teléfono *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Ej. 11 2345 6789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-700 text-white rounded-xl text-xs h-10"
                  />
                </div>
              </div>
            </div>

            {/* Dirección de entrega o Selección de Sucursal */}
            {deliveryType === "delivery" ? (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Dirección de Entrega *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Calle, número, piso/departamento, timbre"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-700 text-white rounded-xl text-xs h-10"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Sucursal de Retiro</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl text-xs h-10 px-3 font-semibold focus:outline-none"
                >
                  <option value="Sucursal Maciel">Sucursal Maciel (Av. Maciel 1240)</option>
                  <option value="Sucursal Alfaro">Sucursal Alfaro (Alfaro 1954)</option>
                  <option value="Casa Central">Casa Central Frigorífico</option>
                </select>
              </div>
            )}

            {/* Método de pago */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Método de Pago</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "efectivo", label: "💵 Efectivo" },
                  { id: "transferencia", label: "📱 QR / Transf." },
                  { id: "tarjeta", label: "💳 Tarjeta" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      paymentMethod === m.id
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aclaraciones */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Notas para el preparador (opcional)</label>
              <Input
                placeholder="Ej. Grasa media, separar en dos bolsas..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white rounded-xl text-xs h-9"
              />
            </div>

            {/* Total final */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-sm font-black">
              <span>Total a Pagar:</span>
              <span className="text-emerald-400 font-mono text-lg">{formatMoney(finalTotal)}</span>
            </div>

            <Button
              onClick={handleConfirmOrder}
              disabled={isSubmittingOrder}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black h-12 rounded-xl text-sm shadow-xl shadow-emerald-500/20 active:scale-98 transition-all"
            >
              {isSubmittingOrder ? "Confirmando pedido..." : "Confirmar Pedido"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Modal de Éxito de Pedido ─── */}
      {orderConfirmed && (
        <Dialog open={Boolean(orderConfirmed)} onOpenChange={() => setOrderConfirmed(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md p-6 rounded-3xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8" />
            </div>
            <DialogTitle className="text-xl font-black text-white">¡Pedido Confirmado!</DialogTitle>
            <p className="text-xs text-slate-400 mt-1">
              Tu pedido <span className="font-mono font-bold text-emerald-400">#{orderConfirmed.id}</span> ya fue
              recibido e ingresó a nuestra base central.
            </p>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-left my-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente:</span>
                <span className="font-bold text-white">{orderConfirmed.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Entrega:</span>
                <span className="font-bold text-white truncate max-w-[200px]">
                  {orderConfirmed.deliveryAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total:</span>
                <span className="font-black text-emerald-400 font-mono text-sm">
                  {formatMoney(orderConfirmed.total)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => {
                  const text = encodeURIComponent(
                    `Hola! Acabo de hacer el pedido ${orderConfirmed.id} en RepartoFacil por un total de ${formatMoney(
                      orderConfirmed.total
                    )}. Nombre: ${orderConfirmed.customerName}`
                  )
                  window.open(`https://wa.me/?text=${text}`, "_blank")
                }}
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black rounded-xl h-11 text-xs"
              >
                Enviar confirmación por WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => setOrderConfirmed(null)}
                className="w-full border-slate-700 text-slate-300 rounded-xl h-10 text-xs"
              >
                Seguir navegando en la tienda
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
