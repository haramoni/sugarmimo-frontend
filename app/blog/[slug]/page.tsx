import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";

import NavBarMenu from "../../components/ui/NavBarMenu";
import { SiteFooter } from "../../components/ui/SiteFooter";
import { blogPosts, formatBlogDate, getBlogPost } from "../blog-data";
import { site } from "@/lib/site";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: "Artigo não encontrado | SugarMimo" };
  }

  return {
    title: `${post.title} | SugarMimo`,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      images: [{ url: post.image, alt: post.imageAlt }],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: `${site.url}${post.image}`,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "SugarMimo" },
    publisher: {
      "@type": "Organization",
      name: "SugarMimo",
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/brand/monogram-dark.webp`,
      },
    },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
  };

  return (
    <main className="page-marble-background min-h-screen bg-cover bg-center text-black-jewel">
      <NavBarMenu />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <article className="px-6 pb-20 pt-28 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 py-3 text-sm font-extrabold text-gold transition hover:text-emerald"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao blog
          </Link>

          <header className="mt-5 text-center">
            <span className="inline-flex rounded-full bg-emerald/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-emerald">
              {post.category}
            </span>
            <h1 className="mx-auto mt-5 max-w-4xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">
              {post.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-black-jewel/65">
              {post.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm font-semibold text-black-jewel/55">
              <time
                dateTime={post.date}
                className="inline-flex items-center gap-2"
              >
                <CalendarDays className="h-4 w-4 text-gold" />
                {formatBlogDate(post.date)}
              </time>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold" />
                {post.readTime}
              </span>
            </div>
          </header>

          <div className="relative mt-10 aspect-[3/2] overflow-hidden rounded-3xl border border-gold/25 bg-gold/10 shadow-[0_24px_70px_rgba(20,17,14,0.14)]">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              priority
              quality={95}
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>

          <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-gold/20 bg-white/80 px-6 py-8 shadow-[0_18px_50px_rgba(20,17,14,0.07)] sm:px-10 sm:py-12">
            {post.content.map((section) => (
              <section key={section.heading} className="mb-10 last:mb-0">
                <h2 className="font-serif text-3xl font-semibold leading-tight text-black-jewel">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-5">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-base font-medium leading-8 text-black-jewel/75 sm:text-lg"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="mt-10 rounded-3xl bg-[color-mix(in_srgb,var(--emerald)_92%,black)] px-7 py-9 text-center text-white sm:px-12">
            <h2 className="font-serif text-3xl font-semibold">
              Pronta para conhecer novas conexões?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-white/75">
              Faça parte de uma comunidade para adultos que valorizam
              transparência, respeito e experiências especiais.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-gold px-7 text-sm font-extrabold text-white transition hover:bg-gold-soft hover:text-black-jewel"
            >
              Criar meu perfil
            </Link>
          </aside>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
