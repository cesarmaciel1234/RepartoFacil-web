import type { Product } from "@/data/mockProducts";

export type PurchasableProduct = Product & {
  price: number;
  stockKg: number;
  priceSource?: "tpv";
};

export function hasValidPrice(
  product: Product
): product is Product & { price: number } {
  return (
    typeof product.price === "number" &&
    Number.isFinite(product.price) &&
    product.price > 0
  );
}

export function getProductStock(product: Product): number {
  const raw =
    product.stockKg ??
    (product as any).stock ??
    (product as any).stock_actual ??
    (product as any).cantidad ??
    (product as any).existencia;

  if (typeof raw === "number" && Number.isFinite(raw)) {
    if (raw > 0) return raw;
    // En TPV de carnicerías, productos pesables a menudo registran ventas en negativo (-146.51 KG)
    // porque no se carga stock inicial de medias reses. Tratar como disponible para la venta.
    if (raw < 0) return Math.abs(raw) + 100;
    // Si es exactamente 0 pero tiene precio válido y no está marcado fuera de stock, asignar disponibilidad TPV
    if (!(product as any).isOutOfStock) return 999;
    return 0;
  }

  if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      if (parsed > 0) return parsed;
      if (parsed < 0) return Math.abs(parsed) + 100;
      if (!(product as any).isOutOfStock) return 999;
      return 0;
    }
  }

  // Stock por defecto para productos del TPV con precio activo
  return (product as any).isOutOfStock ? 0 : 999;
}

export function hasValidStock(
  product: Product
): product is Product & { stockKg: number } {
  const stock = getProductStock(product);
  return typeof stock === "number" && Number.isFinite(stock);
}

export function isProductPurchasable(
  product: Product
): product is PurchasableProduct {
  if (!hasValidPrice(product)) return false;
  if ((product as any).isOutOfStock === true) return false;
  if ((product as any).catalogCached === true) return false;
  const stock = getProductStock(product);
  return stock > 0;
}

export function productAvailabilityMessage(product: Product): string {
  if (!hasValidPrice(product)) return "Precio pendiente";
  if ((product as any).isOutOfStock === true) return "Agotado";
  const stock = getProductStock(product);
  if (stock <= 0) return "Agotado";
  return "";
}
