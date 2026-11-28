import { NextRequest } from "next/server";
import { handleGetOrders } from "./core/orderGetAction";
import { handlePostOrder } from "./core/orderPostAction";
import { handlePatchOrder } from "./core/orderPatchAction";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders: Obtener pedidos con filtrado estricto por cliente, empresa o chofer.
 */
export async function GET(request: NextRequest) {
  return handleGetOrders(request);
}

/**
 * POST /api/orders: Crear nuevo pedido real desde la tienda con asignación de IDs únicos de cliente y empresa.
 */
export async function POST(request: NextRequest) {
  return handlePostOrder(request);
}

/**
 * PATCH /api/orders: Tomar pedido (Assigned), Retirar pedido (Picked Up), Embalar (embalado) o Entregar pedido (Delivered).
 */
export async function PATCH(request: NextRequest) {
  return handlePatchOrder(request);
}
