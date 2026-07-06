/**
 * Bandera de una selección. Acepta una URL de imagen (datos en vivo de la API)
 * o un emoji (datos estáticos); si no hay nada, muestra un balón. Las imágenes
 * se dimensionan para alinearse con el texto adyacente (relación ~4:3).
 */
export default function Flag({ flag, className }: { flag?: string; className?: string }) {
  if (flag && /^https?:\/\//.test(flag)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- bandera diminuta remota, sin optimización
      <img
        src={flag}
        alt=""
        aria-hidden
        loading="lazy"
        className={`inline-block h-3.5 w-5 shrink-0 rounded-[2px] object-cover align-[-2px] ${className ?? ""}`}
      />
    );
  }
  return (
    <span aria-hidden className={`leading-none ${className ?? ""}`}>
      {flag || "⚽"}
    </span>
  );
}
