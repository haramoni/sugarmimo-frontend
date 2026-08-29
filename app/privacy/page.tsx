import type { Metadata } from "next";
import { FileText, Mail, ShieldCheck } from "lucide-react";

import NavBarMenu from "../components/ui/NavBarMenu";
import { SiteFooter } from "../components/ui/SiteFooter";
import policyPages from "./policy-pages";
import styles from "./privacy.module.css";
import { CURRENT_PRIVACY_POLICY_DATE } from "./privacy-policy";

export const metadata: Metadata = {
  title: "Política de Privacidade e Proteção de Dados | SugarMimo",
  description:
    "Política de Privacidade e Proteção de Dados Pessoais da Sugar Mimo.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Política de Privacidade e Proteção de Dados | SugarMimo",
    description:
      "Política de Privacidade e Proteção de Dados Pessoais da Sugar Mimo.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <NavBarMenu />

      <header className={styles.hero}>
        <div className={styles.heroTexture} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            <ShieldCheck aria-hidden="true" />
            <span>SPARKBRIDGE VENTURES</span>
          </div>
          <h1>Política de Privacidade<br />{" "}e Proteção de Dados</h1>
          <dl className={styles.documentMeta}>
            <div>
              <dt>Nome da Plataforma</dt>
              <dd>SUGAR MIMO</dd>
            </div>
            <div>
              <dt>Website</dt>
              <dd>https://sugarmimo.com/</dd>
            </div>
            <div>
              <dt>Última atualização</dt>
              <dd>{CURRENT_PRIVACY_POLICY_DATE}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Páginas do documento">
          <div className={styles.sidebarInner}>
            <p className={styles.sidebarTitle}>
              <FileText aria-hidden="true" />
              Documento integral
            </p>
            <nav>
              {policyPages.map((_, index) => (
                <a key={index} href={`#pagina-${index + 1}`}>
                  Página {String(index + 1).padStart(2, "0")}
                </a>
              ))}
            </nav>
            <a className={styles.contactLink} href="mailto:denuncia@sugarmimo.com">
              <Mail aria-hidden="true" />
              denuncia@sugarmimo.com
            </a>
          </div>
        </aside>

        <article className={styles.document} aria-label="Texto integral da política">
          {policyPages.map((pageText, index) => (
            <section
              key={index}
              id={`pagina-${index + 1}`}
              className={styles.documentPage}
              aria-label={`Página ${index + 1} de ${policyPages.length}`}
            >
              <div className={styles.pageNumber} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </div>
              <pre>{pageText}</pre>
            </section>
          ))}
        </article>
      </div>

      <SiteFooter />
    </main>
  );
}
