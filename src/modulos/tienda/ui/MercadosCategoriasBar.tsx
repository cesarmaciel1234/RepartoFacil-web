import React from "react";

export interface CategoryItem {
  id: string;
  name: string;
  emoji: string;
}

export interface MercadosCategoriasBarProps {
  categories: CategoryItem[];
  selectedCat: string;
  categoryFilter?: string | string[];
  onSelectCat: (id: string) => void;
}

export function MercadosCategoriasBar({
  categories,
  selectedCat,
  categoryFilter,
  onSelectCat,
}: MercadosCategoriasBarProps) {
  return (
    <>
      <div className="flex gap-2.5 overflow-x-auto pt-1 scrollbar-hide sm:gap-3">
        {categories.map((cat) => {
          const isSelected =
            categoryFilter === undefined
              ? selectedCat === cat.id
              : Array.isArray(categoryFilter)
              ? categoryFilter.includes(cat.id)
              : categoryFilter === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCat(cat.id)}
              className="group flex min-w-[82px] max-w-[120px] flex-1 flex-col items-center gap-1.5 text-center cursor-pointer"
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

      <div className="h-2 -mx-3 sm:-mx-4 bg-slate-100/80 border-y border-slate-200/60" />
    </>
  );
}
