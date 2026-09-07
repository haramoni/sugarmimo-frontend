import Link from "next/link";

export function GuideLinks() {
  return (
    <section aria-labelledby="sugar-guides-title" className="border-y border-gold/20 bg-[#11100e] px-6 py-16 text-[#f4ecdf] sm:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[#e1bd8a]">Guias SugarMimo</p>
        <h2 id="sugar-guides-title" className="mt-4 font-serif text-3xl sm:text-4xl">Entenda o universo sugar</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["/relacionamento-sugar", "Relacionamento sugar", "O que significa, como funciona e quais expectativas conversar."],
            ["/sugar-baby", "Sugar baby", "Entenda o perfil, o cadastro e os cuidados para começar."],
            ["/sugar-daddy", "Sugar daddy", "Conheça a dinâmica e como iniciar conversas com respeito."],
          ].map(([href, title, description]) => (
            <Link key={href} href={href} className="rounded-2xl border border-[#e1bd8a]/25 p-7 transition hover:border-[#e1bd8a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e1bd8a]">
              <h3 className="font-serif text-2xl text-[#e1bd8a]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#c7c2b9]">{description}</p>
              <span className="mt-5 block text-sm font-semibold">Ler o guia →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
