"use client";

import React, { useState } from "react";
import { MOCK_COMPANIES, CompanyStore } from "@/data/mockCompanies";
import { INITIAL_PRODUCTS, Product } from "@/data/mockProducts";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Store,
  Star,
  Clock,
  Bike,
  Tag,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

interface VistaMercadosEmpresasProps {
  onSelectCompany: (company: CompanyStore, initialSearch?: string) => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export function VistaMercadosEmpresas({
  onSelectCompany,
  searchQuery: externalSearch,
  onSearchChange: setExternalSearch,
}: VistaMercadosEmpresasProps) {
  const [internalSearch, setInternalSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("todos");

  const searchTerm = externalSearch !== undefined ? externalSearch : internalSearch;
  const handleSearchChange = (val: string) => {
    if (setExternalSearch) {
      setExternalSearch(val);
    } else {
      setInternalSearch(val);
    }
  };

  const categories = [
    { id: "todos", name: "Todos", emoji: "🛒" },
    { id: "carnes", name: "Carnicerías", emoji: "🥩" },
    { id: "kioscos", name: "Kioscos 24hs", emoji: "🍫" },
    { id: "minimercados", name: "Almacén", emoji: "🧀" },
  ];

  const term = searchTerm.toLowerCase().trim();

  const filtered = MOCK_COMPANIES.map((comp) => {
    // Buscar productos de esta empresa que coincidan con la búsqueda
    const matchingProducts = term
      ? INITIAL_PRODUCTS.filter(
          (p) =>
            (p.companyId === comp.id || (!p.companyId && comp.id === "frigorifico-maciel")) &&
            (p.name.toLowerCase().includes(term) ||
              p.description.toLowerCase().includes(term) ||
              p.category.toLowerCase().includes(term))
        )
      : [];

    const matchesSearch =
      !term ||
      comp.name.toLowerCase().includes(term) ||
      comp.category.toLowerCase().includes(term) ||
      comp.address.toLowerCase().includes(term) ||
      matchingProducts.length > 0;

    const matchesCat = selectedCat === "todos" || comp.categorySlug === selectedCat;

    return {
      comp,
      matchingProducts,
      isVisible: matchesSearch && matchesCat,
    };
  }).filter((item) => item.isVisible);

  return (
    <div className="space-y-4 max-w-3xl mx-auto w-full">
      {/* ─── 1. Barra de Búsqueda Grande (Captura 2 y 3) ─── */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar productos (ej. asado, coca, fernet)..."
          className="pl-10 h-12 bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-2xl text-xs sm:text-sm shadow-inner focus:border-emerald-500 transition-colors"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* ─── 2. Carrusel de Categorías Rápidas (Captura 2) ─── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCat(cat.id)}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
              selectedCat === cat.id
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-102"
                : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700"
            }`}
          >
            <span className="text-sm">{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* ─── 3. Listado de Tarjetas de Empresas (Captura 2 y 3) ─── */}
      <div className="space-y-3 pt-1">
        {filtered.map(({ comp, matchingProducts }) => (
          <div
            key={comp.id}
            onClick={() => onSelectCompany(comp, term)}
            className="group p-4 rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/30 transition-all cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {/* Logo / Letra Inicial */}
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center font-black text-xl text-emerald-400 shrink-0 group-hover:scale-105 transition-transform shadow-md">
                  {comp.name.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-white group-hover:text-emerald-400 transition-colors">
                      {comp.name}
                    </span>
                    <Badge className="bg-emerald-500/90 text-white text-[9px] px-1.5 py-0 font-extrabold">
                      ACTIVO
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-400 block font-medium mt-0.5">
                    {comp.category} · {comp.address}
                  </span>

                  {/* Métricas: Rating, Tiempo, Envío */}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-semibold">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {comp.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {comp.deliveryTimeMin}-{comp.deliveryTimeMax} min
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Bike className="w-3.5 h-3.5" />
                      ${comp.deliveryFee.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Flecha indicador entrar */}
              <div className="w-8 h-8 rounded-full bg-slate-800/80 group-hover:bg-emerald-500 group-hover:text-white text-slate-400 flex items-center justify-center transition-colors shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* ─── Captura 3: Productos disponibles en catálogo coincidentes con la búsqueda ─── */}
            {matchingProducts.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-800/90">
                <span className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Productos disponibles en catálogo:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {matchingProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCompany(comp, p.name);
                      }}
                      className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 active:scale-95 transition-all flex items-center gap-1.5"
                      title={`Ver ${p.name} en ${comp.name}`}
                    >
                      <span>{p.name}</span>
                      <span className="text-emerald-400 font-black">
                        · ${p.price.toLocaleString("es-AR")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Badges de Promociones (Estilo PedidosYa) */}
            {comp.badges && comp.badges.length > 0 && matchingProducts.length === 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80">
                {comp.badges.map((b, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-14 bg-slate-900/40 rounded-3xl border border-slate-800/60 p-6 space-y-2">
            <Store className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">
              No encontramos empresas con &ldquo;{searchTerm}&rdquo;
            </p>
            <p className="text-xs text-slate-500">
              Probá buscando carnicería, kiosco, bebidas o seleccionando &ldquo;Todos&rdquo;.
            </p>
          </div>
        )}
      </div>

      {/* ─── 4. Banner Cobro Fácil Cloud Sync ─── */}
      <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between text-xs text-blue-200 shadow-md">
        <div className="space-y-0.5">
          <span className="font-extrabold flex items-center gap-1.5 text-white">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Conectado con Cobro Fácil en Render
          </span>
          <span className="text-[11px] text-blue-300 block">
            Sincronización automática de inventario y facturación multitienda.
          </span>
        </div>
        <a
          href="https://cobrofacil.onrender.com"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
          title="Abrir Cobro Fácil"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
