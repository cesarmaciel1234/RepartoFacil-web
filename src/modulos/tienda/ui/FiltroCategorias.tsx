"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/data/mockProducts";

interface CategoryOption {
  id: string;
  name: string;
  icon: string;
}

interface FiltroCategoriasProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategorySelect: (id: string) => void;
  categories?: CategoryOption[];
}

export function FiltroCategorias({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  categories,
}: FiltroCategoriasProps) {
  const activeCategories = categories && categories.length > 0 ? categories : CATEGORIES;
  return (
    <div className="space-y-3">
      {/* Buscador de inventario de la empresa */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          placeholder="Buscar artículo o departamento en el inventario..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-2xl pl-9 pr-4 h-11 text-xs focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner"
        />
      </div>

      {/* Pills de departamentos del inventario de la empresa */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {activeCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-102"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
