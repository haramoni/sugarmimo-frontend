import Image from "next/image";
import Link from "next/link";
import NavBarMenu from "./components/ui/NavBarMenu";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[url('/register-wallpaper-marble.jpg')] bg-cover bg-center text-black-jewel">
      <NavBarMenu />

      <section className="relative isolate min-h-screen border-b border-gold/45">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-casal-sugarmimo-v2.png"
            alt="Casal elegante em um encontro sofisticado"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[64%_center]"
          />
        </div>

        <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-16 pt-28 sm:px-10 lg:px-16">
          <div className="max-w-xl">
            <h1 className="font-serif text-5xl font-semibold leading-[0.98] tracking-normal text-black-jewel sm:text-6xl lg:text-7xl">
              <span className="text-gold">Encontre Conexoes de</span> Prestigio
              e Romance de Elite
            </h1>
            <div className="bg-white/30 p-2 rounded-2xl">
              <p className="max-w-lg text-lg font-medium leading-7 text-black-jewel/85">
                Descubra o SugarMimo, um refúgio para relacionamentos refinados,
                seguros e mutuamente gratificantes entre pessoas generosas e
                sofisticadas.
              </p>
            </div>

            <Link
              href="/register"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-gold px-8 text-sm font-extrabold uppercase tracking-normal text-black-jewel shadow-[0_12px_28px_rgba(185,138,56,0.26)] transition duration-200 hover:bg-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Criar perfil gratis
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
