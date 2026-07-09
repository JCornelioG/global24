"use client";

import { useEffect, useRef, useState } from "react";
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
 *
 * `label` muestra una etiqueta discreta (ej. "Publicidad") arriba del anuncio;
 * solo aparece cuando el bloque está activo. `className` va al contenedor.
 */
export default function AdSlot({
  slot,
  className,
  label,
}: {
  slot?: string;
  className?: string;
  label?: string;
}) {
  const insRef = useRef<HTMLModElement>(null);
  const [unfilled, setUnfilled] = useState(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // El loader de AdSense aún no cargó; se reintenta en el próximo montaje.
    }
    const ins = insRef.current;
    if (!ins) return;
    // Si AdSense no tiene anuncio para este bloque (data-ad-status="unfilled"),
    // se oculta todo el contenedor (incluida la etiqueta) para no dejar hueco.
    const obs = new MutationObserver(() => {
      if (ins.getAttribute("data-ad-status") === "unfilled") setUnfilled(true);
    });
    obs.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });
    return () => obs.disconnect();
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot) return null;

  return (
    <div className={className} style={unfilled ? { display: "none" } : undefined}>
      {label && (
        <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-faint/70">
          {label}
        </p>
      )}
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
