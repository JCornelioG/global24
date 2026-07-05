"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Imagen de noticia con fallback elegante.
 *
 * IMPORTANTE: usa `next/image` con `fill`, por lo que el contenedor padre
 * DEBE ser `position: relative` (clase `relative`) y tener dimensiones
 * definidas (ej. `aspect-video`). El fallback también se posiciona con
 * `absolute inset-0` dentro de ese mismo contenedor.
 *
 * Si no hay `src`, o la carga falla (`onError`), renderiza un panel
 * `.image-fallback` con la inicial del `alt` en dorado gigante.
 */
export default function SmartImage({
  src,
  alt,
  className,
  sizes,
  priority,
}: {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  // Se guarda la URL que falló para que un cambio de `src` reintente solo.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    const initial = alt.trim().charAt(0).toUpperCase() || "G";
    return (
      <div
        aria-hidden="true"
        className={`image-fallback absolute inset-0 flex items-center justify-center ${className ?? ""}`}
      >
        <span className="select-none font-display text-5xl font-bold text-gold opacity-25">
          {initial}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      // `priority` está deprecado en Next 16: se mapea a `preload`.
      preload={priority}
      className={`object-cover ${className ?? ""}`}
      onError={() => setFailedSrc(src)}
    />
  );
}
