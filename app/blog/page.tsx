import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Clock } from "lucide-react";

import NavBarMenu from "../components/ui/NavBarMenu";
import { SiteFooter } from "../components/ui/SiteFooter";
import { blogPosts, formatBlogDate } from "./blog-data";

export const metadata: Metadata = {
  title: "Blog sobre Relacionamentos e Universo Sugar | SugarMimo",
  description:
    "Conteúdos sobre relacionamentos, segurança, comunicação, encontros e o universo sugar para criar conexões mais conscientes.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog SugarMimo: relacionamentos e universo sugar",
    description:
      "Informação para viver conexões mais transparentes, seguras e respeitosas.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <main className="page-marble-background min-h-screen bg-cover bg-center text-black-jewel">
      <NavBarMenu />

      <section className="border-b border-gold/30 px-6 pb-16 pt-32 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-gold shadow-sm">
              <BookOpen className="h-4 w-4" />
              Conteúdo SugarMimo
            </span>
            <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight sm:text-6xl">
              Conversas que inspiram conexões mais conscientes
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-black-jewel/70">
              Informação sobre relacionamentos, segurança e universo sugar para
              você fazer escolhas com mais clareza, autonomia e confiança.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <article
              key={post.slug}
              className="group flex overflow-hidden rounded-3xl border border-gold/25 bg-white/80 shadow-[0_18px_50px_rgba(20,17,14,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(20,17,14,0.14)]"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="flex w-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-gold/10">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="w-fit rounded-full bg-emerald/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald">
                    {post.category}
                  </span>
                  <h2 className="mt-4 font-serif text-2xl font-semibold leading-snug transition group-hover:text-gold">
                    {post.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm font-medium leading-7 text-black-jewel/65">
                    {post.excerpt}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-gold/20 pt-4 text-xs font-semibold text-black-jewel/55">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-gold" />
                      {formatBlogDate(post.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gold" />
                      {post.readTime}
                    </span>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-gold">
                    Ler artigo
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
