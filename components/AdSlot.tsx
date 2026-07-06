"use client";

import { useEffect } from "react";
import { ADSENSE_CLIENT } from "@/lib/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Bloque de anuncio de AdSense. No renderiza nada hasta que estén configurados
 * el ID de editor (NEXT_PUBLIC_ADSENSE_CLIENT) y el id de bloque (`slot`), así
 * no deja huecos ni provoca saltos de layout antes de la aprobación.
 */
export default function AdSlot({ slot, className }: { slot?: string; className?: string }) {
  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // El loader de AdSense aún no cargó; se reintenta en el próximo montaje.
    }
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot) return null;

  return (
    <ins
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
