"use client";

import { Crown, Sparkles } from "lucide-react";
import { useState } from "react";

import { Navbar } from "../components/ui/Navbar";
import styles from "./clube-vip.module.css";

export default function ClubeVipPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.experience} aria-labelledby="clube-vip-title">
        <div className={`${styles.stage} ${isOpen ? styles.isOpen : ""}`}>
          <div className={styles.clubInterior} aria-hidden={!isOpen}>
            <div className={styles.ambientGlow} />
            <article className={styles.content}>
              <span className={styles.crown} aria-hidden="true">
                <Crown />
              </span>
              <p className={styles.eyebrow}>Em desenvolvimento</p>
              <h1 id="clube-vip-title">Clube VIP SugarMimo</h1>
              <div className={styles.divider}>
                <span />
                <Sparkles aria-hidden="true" />
                <span />
              </div>
              <p>
                Esta área exclusiva ainda está em desenvolvimento e será
                destinada somente a Sugar Daddies e Sugar Babies
                cuidadosamente selecionados, com acesso concedido de forma
                individual.
              </p>
              <p>
                Um ambiente de luxo criado para reunir os melhores perfis da
                comunidade, facilitar conexões especiais e oferecer acesso
                privilegiado a contatos selecionados. Em breve, uma experiência
                reservada para quem faz parte do melhor da SugarMimo.
              </p>
            </article>
          </div>

          <div className={`${styles.door} ${styles.leftDoor}`} aria-hidden="true" />
          <div className={`${styles.door} ${styles.rightDoor}`} aria-hidden="true" />

          <button
            type="button"
            className={styles.enterButton}
            onClick={() => setIsOpen(true)}
            disabled={isOpen}
            aria-label="Entrar no Clube VIP"
          >
            Entrar
          </button>
        </div>
      </section>
    </main>
  );
}
