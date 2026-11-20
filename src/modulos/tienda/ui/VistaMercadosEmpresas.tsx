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
  const [companies, setCompanies] = useState<CompanyStore[]>(MOCK_COMPANIES);

  // Sincronizar dinámicamente las empresas dadas de alta en Cobro Fácil (PostgreSQL)
  React.useEffect(() => {
    fetch("/api/cobrofacil/companies")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.empresas) && data.empresas.length > 0) {
          setCompanies(data.empresas);
        }
      })
      .catch((err) => console.warn("Error cargando empresas dinámicas:", err));
  }, []);

  const searchTerm = externalSearch !== undefined ? externalSearch : internalSearch;
  const handleSearchChange = (val: string) => {
    if (setExternalSearch) {
      setExternalSearch(val);
    } else {
      setInternalSearch(val);
    }
  };

  const categories = [
    { id: "todos", name: "Supermercados", emoji: "🛒" },
    { id: "carnes", name: "Carnicerías", emoji: "🥩" },
    { id: "kioscos", name: "Kioscos", emoji: "🍫" },
    { id: "minimercados", name: "Minimercados", emoji: "🧃" },
  ];

  const term = searchTerm.toLowerCase().trim();

  const filtered = companies.map((comp) => {
    // Buscar productos de esta empresa que coincidan con la búsqueda
    const matchingProducts = term
      ? INITIAL_PRODUCTS.filter(
          (p) =>
            (p.companyId === comp.id || (comp.slug && p.companyId === comp.slug) || (!p.companyId && comp.id === "frigorifico-maciel")) &&
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
      {/* ─── 1. Barra de Búsqueda Redondeada Blanca / Gris Claro (Estilo Mercado Libre / PedidosYa) ─── */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar productos y locales"
          className="pl-11 h-12 bg-slate-100/90 hover:bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-full text-sm shadow-xs focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* ─── 2. Tarjetas Cuadradas de Categorías con Sombra Suave (Como en la imagen de referencia) ─── */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 pt-1">
        {categories.map((cat) => {
          const isSelected = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id === selectedCat && cat.id !== "todos" ? "todos" : cat.id)}
              className="group flex flex-col items-center gap-1.5 text-center cursor-pointer"
            >
              <div
                className={`w-full aspect-[4/3] max-h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl transition-all ${
                  isSelected
                    ? "bg-blue-50 border-2 border-blue-600 shadow-md shadow-blue-600/10 scale-[1.02]"
                    : "bg-white border border-slate-200/90 shadow-sm hover:border-blue-300 hover:shadow-md"
                }`}
              >
                <span className="group-hover:scale-110 transition-transform">{cat.emoji}</span>
              </div>
              <span
                className={`text-[11px] sm:text-xs leading-tight truncate w-full ${
                  isSelected ? "font-black text-blue-600" : "font-semibold text-slate-700"
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Separador visual suave */}
      <div className="h-2 -mx-3 sm:-mx-4 bg-slate-100/80 border-y border-slate-200/60" />

      {/* ─── 3. Listado de Locales / Empresas sobre Fondo Blanco Limpio ─── */}
      <div className="divide-y divide-slate-100 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filtered.map(({ comp, matchingProducts }) => (
          <div
            key={comp.id}
            onClick={() => onSelectCompany(comp, term)}
            className="group p-4 bg-white hover:bg-blue-50/30 transition-all cursor-pointer active:bg-slate-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Logo / Avatar Cuadrado Redondeado estilo App */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-200 flex items-center justify-center font-black text-xl text-white shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  {comp.name.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Fila 1: Nombre del Local + Rating ★ a la derecha */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {comp.name}
                    </span>
                    <span className="flex items-center gap-1 text-slate-900 font-extrabold text-xs shrink-0">
                      <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
                      {comp.rating}
                    </span>
                  </div>

                  {/* Fila 2: Categoría y dirección */}
                  <span className="text-xs text-slate-500 block font-medium mt-0.5 truncate">
                    {comp.category} · {comp.address}
                  </span>

                  {/* Fila 3: Tiempo de entrega */}
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {comp.deliveryTimeMin}-{comp.deliveryTimeMax} min
                    </span>
                  </div>

                  {/* Fila 4: Costo de envío + sello azul */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <Bike className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      ${comp.deliveryFee.toLocaleString("es-AR")}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-extrabold text-blue-600">
                      Envío directo
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-600 text-white">
                      TPV
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Productos disponibles en catálogo coincidentes con la búsqueda ─── */}
            {matchingProducts.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <span className="text-[11px] text-blue-600 font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
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
                      className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 active:scale-95 transition-all flex items-center gap-1.5"
                      title={`Ver ${p.name} en ${comp.name}`}
                    >
                      <span>{p.name}</span>
                      <span className="text-blue-900 font-black">
                        · ${p.price.toLocaleString("es-AR")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Badges de Promociones (Estilo amarillo/azul limpio como en la captura) */}
            {comp.badges && comp.badges.length > 0 && matchingProducts.length === 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 pl-[4.35rem]">
                {comp.badges.map((b, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      idx === 0
                        ? "bg-amber-300/90 text-slate-900"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
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
          <div className="text-center py-14 bg-white p-6 space-y-2">
            <Store className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              No encontramos empresas con &ldquo;{searchTerm}&rdquo;
            </p>
            <p className="text-xs text-slate-500">
              Probá buscando carnicería, kiosco, bebidas o seleccionando &ldquo;Supermercados&rdquo;.
            </p>
          </div>
        )}
      </div>

      {/* ─── 4. Banner Cobro Fácil Cloud Sync (Azul y Blanco) ─── */}
      <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 flex items-center justify-between text-xs text-blue-900 shadow-xs">
        <div className="space-y-0.5">
          <span className="font-extrabold flex items-center gap-1.5 text-blue-950">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Conectado con Cobro Fácil TPV
          </span>
          <span className="text-[11px] text-blue-700 block">
            Sincronización automática de inventario y facturación multitienda.
          </span>
        </div>
        <a
          href="https://cobrofacil.onrender.com"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          title="Abrir Cobro Fácil"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
