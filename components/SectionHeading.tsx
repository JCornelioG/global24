import Link from "next/link";

/** Título de sección con barra dorada a la izquierda y CTA opcional. */
export default function SectionHeading({
  title,
  href,
  cta,
}: {
  title: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-3 font-display text-lg font-bold uppercase tracking-wide text-ink sm:text-xl">
        <span aria-hidden="true" className="h-6 w-[3px] shrink-0 rounded-full bg-gold" />
        {title}
      </h2>
      {href && cta && (
        <Link
          href={href}
          className="shrink-0 text-xs font-semibold text-gold transition-colors hover:text-gold-bright"
        >
          {cta} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
