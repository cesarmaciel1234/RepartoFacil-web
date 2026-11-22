import { NextRequest, NextResponse } from "next/server";

export type OrderUser = {
  id: string;
  role: "Client" | "Driver";
  displayName: string;
};

type AuthResult =
  | { user: OrderUser; response?: never }
  | { user?: never; response: NextResponse };

export async function authenticateOrderUser(
  request: NextRequest,
  allowedRoles: OrderUser["role"][]
): Promise<AuthResult> {
  const authorization = request.headers.get("authorization");
  if (!authorization || !/^Bearer\s+\S+$/i.test(authorization)) {
    return { response: NextResponse.json({ error: "Iniciá sesión para continuar." }, { status: 401 }) };
  }

  const backend = process.env.BACKEND_URL || "http://127.0.0.1:8000";
  try {
    const response = await fetch(`${backend}/api/auth/me`, {
      headers: { Authorization: authorization },
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    if (response.status === 401 || response.status === 403) {
      return { response: NextResponse.json({ error: "La sesión no es válida o expiró." }, { status: 401 }) };
    }
    if (!response.ok) {
      console.error("[Order Auth] El servicio de autenticación respondió", response.status);
      return { response: NextResponse.json({ error: "No se pudo verificar la sesión." }, { status: 503 }) };
    }
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") throw new Error("Respuesta de autenticación inválida.");
    const user = data as Record<string, unknown>;
    if (typeof user.id !== "string" || !user.id || user.isAnonymous !== false ||
        (user.role !== "Client" && user.role !== "Driver")) {
      return { response: NextResponse.json({ error: "Se necesita una cuenta registrada." }, { status: 403 }) };
    }
    if (!allowedRoles.includes(user.role)) {
      return { response: NextResponse.json({ error: "La cuenta no tiene el perfil requerido." }, { status: 403 }) };
    }
    return {
      user: {
        id: user.id,
        role: user.role,
        displayName: typeof user.displayName === "string" ? user.displayName : "",
      },
    };
  } catch (error) {
    console.error("[Order Auth] No se pudo verificar la sesión:", error);
    return { response: NextResponse.json({ error: "No se pudo verificar la sesión." }, { status: 503 }) };
  }
}
