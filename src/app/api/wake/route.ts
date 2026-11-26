import { NextResponse } from "next/server";
import { queryDb, isDatabaseConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

// Por defecto apunta a la instancia de producción en Render
const BACKEND_URL = process.env.BACKEND_URL || "https://cobrofacil.onrender.com";

export async function GET() {
  const result: Record<string, any> = {
    timestamp: new Date().toISOString(),
    postgres: "pending",
    backend: "pending",
  };

  // 1. Despertar / calentar conexión a PostgreSQL (solo si cuenta con esquema postgres:// o postgresql:// válido)
  if (isDatabaseConfigured()) {
    try {
      await queryDb("SELECT 1 AS alive");
      result.postgres = "connected";
    } catch (err: any) {
      result.postgres = `error: ${err?.message || err}`;
    }
  } else {
    result.postgres = "skipped_invalid_or_missing_env";
  }

  // 2. Enviar señal HTTP a Render para despertar el backend de FastAPI
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${BACKEND_URL}/health`, {
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    result.backend = res.ok ? "awake" : `status_${res.status}`;
  } catch (err: any) {
    result.backend = `waking_up_or_error: ${err?.name || err?.message}`;
  }

  return NextResponse.json(result);
}
