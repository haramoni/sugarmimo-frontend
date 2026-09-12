import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Crown,
  EyeOff,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { publicMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import styles from "./convite.module.css";

export const metadata: Metadata = {
  ...publicMetadata(
    "Seu próximo encontro começa aqui | SugarMimo",
    "Um convite para homens que valorizam boas conexões. Conheça a SugarMimo, crie seu perfil de Sugar Daddy e comece com até 50 mensagens em 10 dias.",
    "/convite",
    "/brand/hero-trio-hq-4k.webp",
  ),
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

const benefits = [
  {
    icon: EyeOff,
    title: "Discrição em cada escolha",
    text: "Você decide o que compartilhar. Libere suas fotos privadas apenas para quem escolher e revogue o acesso quando quiser.",
  },
  {
    icon: ShieldCheck,
    title: "Uma comunidade com cuidado",
    text: "Perfis e fotos passam por moderação. Ferramentas de denúncia e bloqueio ajudam você a conduzir suas conexões.",
  },
  {
    icon: MessageCircle,
    title: "Intenções na mesma página",
    text: "Conheça mulheres que também valorizam conexões sugar. Converse sobre expectativas e descubra o que faz sentido para os dois.",
  },
];

const steps = [
  {
    title: "Apresente-se",
    text: "Crie seu perfil de Sugar Daddy, adicione suas fotos e conte o que busca em uma conexão.",
  },
  {
    title: "Conheça a comunidade",
    text: "Após a aprovação do cadastro, explore perfis e encontre pessoas com interesses em comum.",
  },
  {
    title: "Dê o primeiro passo",
    text: "Inicie uma conversa, alinhe expectativas e deixe a conexão acontecer no ritmo de vocês.",
  },
];

const faqs = [
  {
    question: "Para quem é este convite?",
    answer:
      "Para homens maiores de 18 anos que desejam participar da SugarMimo como Sugar Daddy e conhecer mulheres adultas interessadas em conexões sugar. Respeito, consentimento e expectativas claras fazem parte de cada encontro.",
  },
  {
    question: "Como funciona o período gratuito?",
    answer:
      "O cadastro é gratuito. Contas Sugar Daddy sem assinatura podem enviar até 50 mensagens nos primeiros 10 dias, contados a partir da criação da conta. O período termina quando os 10 dias acabam ou as 50 mensagens são utilizadas, o que acontecer primeiro. O acesso à comunidade depende da aprovação do cadastro.",
  },
  {
    question: "Preciso cadastrar um cartão para começar?",
    answer:
      "Não. Você pode criar sua conta e usar a franquia inicial de mensagens sem cadastrar um cartão. Depois do período gratuito, é necessário contratar um plano para continuar enviando mensagens. Você escolhe se deseja assinar.",
  },
  {
    question: "Quem pode ver minhas fotos?",
    answer:
      "As fotos públicas compõem seu perfil na comunidade. Para as fotos privadas, você controla a liberação de acesso e pode revogá-la. Compartilhe apenas informações e imagens com as quais se sinta confortável.",
  },
  {
    question: "O que acontece depois do cadastro?",
    answer:
      "Seu perfil passa pela análise da equipe. Após a aprovação, você pode explorar a comunidade e iniciar conversas conforme as condições da sua conta. A SugarMimo oferece o espaço para a conexão; a afinidade e os próximos passos são uma escolha de vocês.",
  },
];

export default async function InvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ perfil: "sugar-daddy" });
  const referral =
    typeof params.ref === "string" ? params.ref.trim().toLowerCase() : "";
  if (/^[a-z0-9._-]{2,30}$/.test(referral)) query.set("ref", referral);
  const registerHref = `/register?${query.toString()}`;
  const registerCta = "Criar meu perfil grátis";

  return (
    <div className={styles.page}>
      <a href="#conteudo" className={styles.skipLink}>
        Pular para o conteúdo
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label="SugarMimo — início">
            <Image
              src="/brand/logo-dark-bg.webp"
              alt="SugarMimo"
              width={180}
              height={42}
              className={styles.logo}
            />
          </Link>
          <span className={styles.headerLabel}>BOAS CONEXÕES COMEÇAM AQUI</span>
          <Link href="/login" className={styles.login}>
            Já sou membro <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main id="conteudo">
        <section
          className={`${styles.container} ${styles.hero}`}
          aria-labelledby="convite-title"
        >
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span /> UM CONVITE PARA VOCÊ
            </p>
            <h1 id="convite-title">
              Sua próxima
              <br />
              boa companhia
              <br />
              <em>começa aqui.</em>
            </h1>
            <p className={styles.intro}>
              Você sabe o que quer. Conheça mulheres que também valorizam boas
              experiências, intenções claras e uma conexão com mais afinidade.
            </p>
            <Link href={registerHref} className={styles.primaryButton}>
              {registerCta}
              <ArrowRight size={23} strokeWidth={2.5} aria-hidden="true" />
            </Link>
            <p className={styles.buttonNote}>
              <Check size={14} aria-hidden="true" /> Cadastro gratuito{" "}
              <span>·</span> Sem cartão para começar
            </p>
            <a href="#como-funciona" className={styles.discoverLink}>
              <ArrowDown size={15} aria-hidden="true" /> Descubra como funciona
            </a>
          </div>
          <figure className={styles.heroVisual}>
            <div className={styles.portrait}>
              <Image
                src="/brand/sugar-card.jpg"
                alt="Mulher adulta em um ambiente elegante com iluminação acolhedora"
                fill
                sizes="(max-width: 700px) 90vw, (max-width: 1000px) 45vw, 490px"
                preload
                className={styles.portraitImage}
              />
              <div className={styles.portraitOverlay} />
              <div className={styles.portraitCaption}>
                <span>A CONEXÃO É DE VOCÊS.</span>
                <p>O convite é nosso.</p>
              </div>
            </div>
            <div className={styles.seal}>
              <Crown size={20} strokeWidth={1.25} aria-hidden="true" />
              <span>
                SUGAR
                <br />
                <strong>MIMO</strong>
              </span>
            </div>
            <figcaption className={styles.imageNote}>
              Imagem ilustrativa da marca.
            </figcaption>
          </figure>
        </section>

        <section className={styles.trial} aria-labelledby="trial-title">
          <div className={`${styles.container} ${styles.trialInner}`}>
            <div className={styles.trialHeading}>
              <Crown size={25} strokeWidth={1.3} aria-hidden="true" />
              <div>
                <p className={styles.eyebrow}>SEU PRIMEIRO PASSO</p>
                <h2 id="trial-title">Conheça antes de decidir.</h2>
              </div>
            </div>
            <div className={styles.trialNumber}>
              <strong>10</strong>
              <span>
                dias para
                <br />
                experimentar
              </span>
            </div>
            <div className={styles.trialNumber}>
              <strong>50</strong>
              <span>
                mensagens
                <br />
                gratuitas, no máximo
              </span>
            </div>
          </div>
          <p className={`${styles.container} ${styles.trialTerms}`}>
            Para contas Sugar Daddy sem assinatura. Válido por 10 dias a partir
            da criação da conta ou até o envio de 50 mensagens, o que ocorrer
            primeiro. Cadastro sujeito à aprovação.
          </p>
        </section>

        <section
          className={`${styles.container} ${styles.benefits}`}
          aria-labelledby="benefits-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>MENOS ACASO. MAIS AFINIDADE.</p>
            <h2 id="benefits-title">
              Boas conexões merecem
              <br />
              <em>o ambiente certo.</em>
            </h2>
            <p>
              Um espaço para homens que valorizam seu tempo, sua privacidade e a
              liberdade de escolher com quem se conectar.
            </p>
          </div>
          <div className={styles.benefitGrid}>
            {benefits.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon size={27} strokeWidth={1.35} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className={styles.experience}
          aria-labelledby="experience-title"
        >
          <div className={`${styles.container} ${styles.experienceInner}`}>
            <figure className={styles.dinner}>
              <Image
                src="/brand/gallery-dinner.jpg"
                alt="Casal adulto conversando durante um jantar à luz de velas"
                fill
                sizes="(max-width: 700px) 100vw, 55vw"
                className={styles.dinnerImage}
              />
              <figcaption>Imagem ilustrativa.</figcaption>
            </figure>
            <div className={styles.experienceCopy}>
              <p className={styles.eyebrow}>A VIDA ACONTECE NO ENCONTRO</p>
              <h2 id="experience-title">
                Um bom jantar.
                <br />
                Uma boa conversa.
                <br />
                <em>Uma nova história.</em>
              </h2>
              <p>
                Às vezes, tudo começa com uma mensagem. Na SugarMimo, você
                encontra espaço para se apresentar, descobrir afinidades e viver
                conexões com expectativas claras.
              </p>
              <div className="flex items-center gap-2 justify-center">
                <Link href={registerHref} className={styles.primaryButton}>
                  {registerCta}
                  <ArrowRight size={23} strokeWidth={2.5} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          className={`${styles.container} ${styles.howItWorks}`}
          aria-labelledby="steps-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>SIMPLES DESDE O COMEÇO</p>
            <h2 id="steps-title">
              Seu próximo capítulo,
              <br />
              <em>em três passos.</em>
            </h2>
          </div>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber}>0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.faq} aria-labelledby="faq-title">
          <div className={`${styles.container} ${styles.faqInner}`}>
            <div>
              <p className={styles.eyebrow}>TUDO ÀS CLARAS</p>
              <h2 id="faq-title">
                Antes de
                <br />
                <em>começar.</em>
              </h2>
              <p className={styles.faqSupport}>
                Prefere falar com a equipe?
                <br />
                <Link href="/atendimento">
                  Conheça nossos canais de atendimento{" "}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </p>
            </div>
            <div className={styles.questions}>
              {faqs.map((faq) => (
                <details key={faq.question} name="convite-faq">
                  <summary>
                    {faq.question}
                    <ChevronDown size={18} aria-hidden="true" />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="final-title">
          <div className={styles.container}>
            <Crown size={30} strokeWidth={1.2} aria-hidden="true" />
            <p className={styles.eyebrow}>O PRIMEIRO PASSO É SEU</p>
            <h2 id="final-title">
              Abra espaço para
              <br />
              <em>uma boa surpresa.</em>
            </h2>

            <p>Seu perfil. Suas escolhas. Novas possibilidades.</p>
            <div className="flex items-center gap-2 justify-center">
              <Link href={registerHref} className={styles.primaryButton}>
                {registerCta}
                <ArrowRight size={23} strokeWidth={2.5} aria-hidden="true" />
              </Link>
            </div>
            <p className={styles.buttonNote}>
              Cadastro gratuito <span>·</span> Exclusivo para maiores de 18 anos
            </p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <Link href="/" aria-label="SugarMimo — início">
            <Image
              src="/brand/logo-dark-bg.webp"
              alt="SugarMimo"
              width={150}
              height={35}
              className={styles.footerLogo}
            />
          </Link>
          <nav aria-label="Informações legais">
            <Link href="/terms">Termos de uso</Link>
            <Link href="/privacy">Privacidade</Link>
            <Link href="/seguranca">Segurança</Link>
            <Link href="/contato">Contato</Link>
          </nav>
          <p>
            Relacionamentos entre adultos, com respeito e consentimento.
            <br />
            {site.name} · {site.legalName}
          </p>
        </div>
      </footer>
      <div className={styles.mobileCta}>
        <Link href={registerHref} className={styles.primaryButton}>
          {registerCta}
          <ArrowRight size={23} strokeWidth={2.5} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
