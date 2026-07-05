export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

/** Maqueta común de las páginas legales (privacidad, cookies). */
export default function LegalLayout({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <div className="container-page py-10 sm:py-14">
      <article className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 text-xs text-faint">{updated}</p>
        {intro && <p className="mt-6 text-[15px] leading-relaxed text-muted">{intro}</p>}

        {sections.map((section) => (
          <section key={section.heading} className="mt-9">
            <h2 className="border-l-[3px] border-gold pl-3 font-display text-lg font-bold text-ink">
              {section.heading}
            </h2>
            {section.paragraphs?.map((paragraph, i) => (
              <p key={i} className="mt-3 text-[15px] leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-muted">
                {section.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
    </div>
  );
}
