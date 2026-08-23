import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, MessageCircle, Sparkles } from "lucide-react";
import { whatsappUrl } from "@/lib/contact";
import styles from "./maintenance.module.css";

export const metadata: Metadata = {
  title: "Em manutenção | SugarMimo",
  description:
    "O SugarMimo está passando por uma breve manutenção para deixar sua experiência ainda mais especial.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <main className={styles.page}>
      <div className={styles.marble} aria-hidden="true" />
      <div className={styles.glowTop} aria-hidden="true" />
      <div className={styles.glowBottom} aria-hidden="true" />

      <section className={styles.shell} aria-labelledby="maintenance-title">
        <header className={styles.header}>
          <Image
            src="/sm-image.png"
            alt="SugarMimo"
            width={220}
            height={119}
            priority
            className={styles.logo}
          />

          <div className={styles.status} role="status">
            <span className={styles.statusDot} aria-hidden="true" />
            Atualização em andamento
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.sparkle} aria-hidden="true">
            <Sparkles size={22} strokeWidth={1.7} />
          </div>

          <p className={styles.eyebrow}>Um pequeno intervalo</p>
          <h1 id="maintenance-title" className={styles.title}>
            Voltamos em <span>breve.</span>
          </h1>
          <p className={styles.description}>
            Estamos preparando uma experiência ainda mais especial para suas
            conexões. Em instantes, o SugarMimo estará disponível novamente.
          </p>

          <div className={styles.progress} aria-hidden="true">
            <span />
          </div>

          <div className={styles.actions}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryAction}
            >
              <MessageCircle size={17} aria-hidden="true" />
              Falar com a equipe
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <p className={styles.note}>Agradecemos a compreensão e a espera.</p>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>© 2026 SugarMimo</p>
          <p>Conexões reais. Experiências especiais.</p>
        </footer>
      </section>
    </main>
  );
}
