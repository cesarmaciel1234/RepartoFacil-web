import { calcularTarifaEnvio } from "@/modulos/tienda/motor/tarifaUberService";

type CatalogProduct = {
  id: string;
  name: string;
  unit: string;
  companyId: string;
  price?: number;
  stockKg?: number;
  stock?: number;
  sucursal_id?: number;
  empresa_id?: number;
  codigo?: string | number;
};

type CatalogCompany = {
  id: string;
  empresa_id: number;
  slug: string;
  name: string;
  deliveryFee: number;
  freeDeliveryThreshold?: number;
  parentCompanyId?: string;
  parentSlug?: string;
  sucursal_id?: number;
};

type SubmittedItem = {
  id?: unknown;
  producto_id?: unknown;
  product_id?: unknown;
  name?: unknown;
  quantity?: unknown;
  price?: unknown;
  unit?: unknown;
};

type SubmittedOrder = {
  companyId?: unknown;
  companySlug?: unknown;
  tienda?: unknown;
  empresaId?: unknown;
  empresa_id?: unknown;
  sucursalId?: unknown;
  sucursal_id?: unknown;
  items?: unknown;
  deliveryType?: unknown;
  deliveryAddress?: unknown;
  subtotal?: unknown;
  deliveryFee?: unknown;
  total?: unknown;
};

function cleanProductId(raw: unknown): string {
  const str = String(raw || "").trim();
  return str.replace(/^(tpv-suc-\d+-|fallback-suc-\d+-|tpv-|emp-\d+-tpv-)/i, "").trim().toLowerCase();
}

function normalizeName(raw: unknown): string {
  return String(raw || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateOrder(
  order: SubmittedOrder,
  products: CatalogProduct[],
  companies: CatalogCompany[]
) {
  const orderCompId = String(order.companyId || "").toLowerCase().trim();
  const orderSlug = String(order.companySlug || order.tienda || "").toLowerCase().trim();
  const orderEmpId = Number(order.empresaId || order.empresa_id);

  const company = companies.find((entry) => {
    const entryId = String(entry.id || "").toLowerCase().trim();
    const entrySlug = String(entry.slug || "").toLowerCase().trim();
    const parentId = String(entry.parentCompanyId || "").toLowerCase().trim();
    const parentSlug = String(entry.parentSlug || "").toLowerCase().trim();

    return (
      entryId === orderCompId ||
      entrySlug === orderCompId ||
      parentId === orderCompId ||
      parentSlug === orderCompId ||
      entrySlug === orderSlug ||
      entryId === orderSlug ||
      entryId === `empresa-${orderCompId}` ||
      (orderEmpId > 0 && Number(entry.empresa_id) === orderEmpId) ||
      ((orderCompId.includes("maciel") || orderSlug.includes("maciel") || orderCompId === "1" || orderEmpId === 1) &&
        (entryId.includes("maciel") || entrySlug === "maciel" || entrySlug === "rumaul" || Number(entry.empresa_id) === 1))
    );
  });

  if (!company || !Number.isInteger(Number(company.empresa_id)) || Number(company.empresa_id) <= 0) {
    throw new Error("El comercio ya no está disponible. Actualizá el catálogo.");
  }
  if (!Array.isArray(order.items) || order.items.length === 0 || order.items.length > 100) {
    throw new Error("El carrito no es válido.");
  }
  if ((order.deliveryType !== "delivery" && order.deliveryType !== "pickup") ||
      typeof order.deliveryAddress !== "string" || !order.deliveryAddress.trim()) {
    throw new Error("La dirección o modalidad de entrega no es válida.");
  }

  const seen = new Set<string>();
  const items = (order.items as SubmittedItem[]).map((submitted) => {
    const submittedRawId = submitted?.id ?? submitted?.producto_id ?? submitted?.product_id;
    const submittedCleanId = cleanProductId(submittedRawId);
    const submittedNormName = normalizeName(submitted?.name);
    const qty = Number(submitted?.quantity);

    if (!submitted || !submittedRawId || seen.has(String(submittedRawId)) ||
        typeof qty !== "number" || !Number.isFinite(qty) || qty <= 0) {
      throw new Error("Los productos o cantidades del carrito no son válidos.");
    }
    seen.add(String(submittedRawId));

    const product = products.find((entry) => {
      const entryCleanId = cleanProductId(entry.id);
      const entryNormName = normalizeName(entry.name);
      const entryCompId = String(entry.companyId || "").toLowerCase().trim();
      const compId = String(company.id || "").toLowerCase().trim();

      const isSameCompany =
        entryCompId === compId ||
        entryCompId === String(company.slug || "").toLowerCase().trim() ||
        (entry.sucursal_id != null && company.sucursal_id != null && Number(entry.sucursal_id) === Number(company.sucursal_id)) ||
        (Number(company.empresa_id) === 1 && (entryCompId.includes("maciel") || Number(entry.empresa_id) === 1 || entry.sucursal_id === 1));

      if (!isSameCompany) return false;

      if (String(entry.id) === String(submittedRawId)) return true;
      if (entryCleanId && entryCleanId === submittedCleanId) return true;
      if (submittedNormName && entryNormName === submittedNormName) return true;

      return false;
    });

    if (!product) {
      throw new Error("Un producto ya no tiene precio o stock disponible. Actualizá el carrito.");
    }

    const price = typeof product.price === "number" && Number.isFinite(product.price) && product.price > 0
      ? product.price
      : 0;

    const rawStock = product.stockKg ?? product.stock;
    const stockKg = typeof rawStock === "number" && Number.isFinite(rawStock)
      ? (rawStock > 0 ? rawStock : (rawStock < 0 ? Math.abs(rawStock) + 100 : 999))
      : 999;

    if (price <= 0 || stockKg <= 0 || qty > stockKg) {
      throw new Error("Un producto ya no tiene precio o stock disponible. Actualizá el carrito.");
    }

    const submittedPrice = Number(submitted.price);
    if (Number.isFinite(submittedPrice) && Math.abs(submittedPrice - price) > 0.05) {
      throw new Error("Cambió el precio de un producto. Actualizá el carrito antes de confirmar.");
    }

    return {
      id: product.id,
      name: product.name,
      unit: product.unit || "KG",
      price: product.price as number,
      quantity: qty,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const threshold = company.freeDeliveryThreshold || 35000;
  if (!Number.isFinite(subtotal) || !Number.isFinite(threshold) || threshold <= 0 ||
      !Number.isFinite(company.deliveryFee) || company.deliveryFee < 0) {
    throw new Error("No se pudo validar el importe del pedido.");
  }
  const tarifa = calcularTarifaEnvio(order.deliveryAddress);
  const deliveryFee = order.deliveryType === "delivery" && subtotal < threshold ? (company.deliveryFee || 2000) : 0;
  const total = subtotal + deliveryFee;

  const matches = (value: unknown, expected: number) =>
    typeof value === "number" && Number.isFinite(value) && Math.abs(value - expected) <= 1.0;

  if (
    (order.subtotal != null && !matches(order.subtotal, subtotal)) ||
    (order.deliveryFee != null && !matches(order.deliveryFee, deliveryFee)) ||
    (order.total != null && !matches(order.total, total))
  ) {
    throw new Error("El importe del pedido cambió. Actualizá el carrito antes de confirmar.");
  }

  return { company, items, subtotal, deliveryFee, total, tarifa };
}
