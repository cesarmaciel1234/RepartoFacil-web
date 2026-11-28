"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Aislamiento total: La aplicación se gobierna desde la ruta raíz "/" con renderizado condicional estricto.
 * `/repartidor` redirige de inmediato mediante `replace` para no crear entradas en el historial del navegador
 * ni permitir swipe atrás de iOS Safari entre pantallas paralelas.
 */
export default function RepartidorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
      Ingresando a Reparto Fácil...
    </div>
  );
}
