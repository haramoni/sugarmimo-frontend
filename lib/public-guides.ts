export type PublicGuide = {
  slug: string;
  label: string;
  title: string;
  description: string;
  intro: string;
  updated: string;
  sections: { id: string; heading: string; paragraphs: string[]; points?: string[] }[];
  questions: { question: string; answer: string }[];
  related: { href: string; label: string }[];
};

export const publicGuides: PublicGuide[] = [
  {
    slug: "relacionamento-sugar",
    label: "Relacionamento sugar",
    title: "Relacionamento sugar: o que é e como funciona | SugarMimo",
    description: "Entenda o relacionamento sugar, as diferenças entre sugar baby e sugar daddy e como conversar sobre expectativas, limites e privacidade entre adultos.",
    intro: "Relacionamento sugar é uma conexão entre adultos que conversam abertamente sobre o que procuram, incluindo companhia, afinidade, estilo de vida e, em alguns casos, presentes ou apoio voluntário. Cada relação tem seus próprios limites: o nome não define um acordo obrigatório.",
    updated: "2026-09-07",
    sections: [
      {
        id: "significado", heading: "O que significa relacionamento sugar?",
        paragraphs: [
          "No uso comum, a expressão descreve relações em que expectativas sobre convivência e generosidade são discutidas desde o início. Uma pessoa pode valorizar experiências compartilhadas; outra pode procurar maturidade, companhia ou uma dinâmica diferente dos aplicativos de namoro tradicionais.",
          "A diferença está na conversa sobre essas expectativas, e não em uma promessa de resultado. Afinidade, afeto, disponibilidade e privacidade precisam fazer sentido para ambos. Ninguém é obrigado a aceitar um encontro ou a continuar uma relação porque recebeu um presente.",
        ],
      },
      {
        id: "perfis", heading: "Sugar baby, sugar daddy e sugar mommy: quem participa?",
        paragraphs: [
          "Sugar baby é o nome usado por uma pessoa adulta que busca essa dinâmica com alguém que se identifica como sugar daddy ou sugar mommy. Daddy e mommy costumam descrever pessoas estabelecidas que valorizam a possibilidade de compartilhar experiências e demonstrar generosidade.",
          "Esses termos não comprovam renda, identidade ou comportamento. Tampouco obrigam um casal a ter determinada diferença de idade. A SugarMimo é exclusiva para maiores de 18 anos, qualquer que seja a categoria escolhida.",
        ],
      },
      {
        id: "expectativas", heading: "O que conversar antes de marcar um encontro",
        paragraphs: ["Troque suposições por perguntas específicas. É possível conversar em etapas, com tempo para decidir se há compatibilidade. Alguns pontos úteis são:"],
        points: [
          "Intenção: conhecer alguém para uma relação contínua ou ainda explorar possibilidades?",
          "Disponibilidade: com que frequência vocês conseguem conversar e se encontrar?",
          "Privacidade: que informações e fotos cada um deseja manter reservadas?",
          "Limites: quais comportamentos não são aceitáveis para cada pessoa?",
          "Generosidade: o que cada um entende por presentes, experiências ou apoio voluntário, sem presumir obrigação de intimidade?",
        ],
      },
      {
        id: "cuidados", heading: "Como começar com mais segurança",
        paragraphs: [
          "Converse pela plataforma antes de compartilhar contatos, desconfie de pedidos de pagamento para liberar supostos presentes e não envie documentos, senhas ou códigos de verificação a outro membro. No primeiro encontro, escolha um local público e tenha autonomia para ir embora.",
          "Uma conta moderada não é garantia sobre a conduta de uma pessoa fora da plataforma. Use os recursos de bloqueio e denúncia quando houver pressão, inconsistências ou comportamento inadequado. Se a conversa não respeita seus limites, você pode encerrá-la.",
        ],
      },
      {
        id: "plataforma", heading: "Como o relacionamento sugar funciona na SugarMimo",
        paragraphs: [
          "A SugarMimo oferece cadastro por categoria, perfis, busca, chat e controles de privacidade. Algumas contas e fotos passam por análise antes de ganhar visibilidade. Recursos disponíveis e condições de acesso variam conforme o perfil e o plano apresentado na plataforma.",
          "A assinatura remunera funcionalidades do site. Ela não compra encontros, não garante respostas e não representa pagamento a outro membro. A plataforma não é parte de acordos, transferências ou presentes particulares entre usuários.",
        ],
      },
    ],
    questions: [
      { question: "Relacionamento sugar sempre envolve dinheiro?", answer: "As expectativas variam e podem incluir experiências, presentes ou apoio voluntário. Não existe valor ou benefício obrigatório definido pela SugarMimo, nem garantia de apoio financeiro." },
      { question: "É necessário ter uma diferença de idade?", answer: "Não existe uma diferença de idade obrigatória. Todas as pessoas devem ser adultas e decidir livremente sobre a relação." },
      { question: "Um presente cria alguma obrigação?", answer: "Presentes ou apoio não substituem consentimento e não criam obrigação de afeto, intimidade ou permanência. Qualquer pessoa pode recusar ou encerrar uma conexão." },
    ],
    related: [
      { href: "/sugar-baby", label: "O que é sugar baby" },
      { href: "/sugar-daddy", label: "O que é sugar daddy" },
      { href: "/blog/acordos-e-expectativas-no-relacionamento-sugar", label: "Como alinhar acordos e expectativas" },
    ],
  },
  {
    slug: "sugar-baby", label: "Sugar baby",
    title: "Sugar baby: o que é, perfil e cuidados para começar | SugarMimo",
    description: "Saiba o que é sugar baby, como criar um perfil na SugarMimo e quais cuidados tomar com expectativas, privacidade, presentes e primeiros encontros.",
    intro: "Sugar baby é uma pessoa adulta que procura um relacionamento sugar com um sugar daddy ou uma sugar mommy. O termo descreve uma preferência de relacionamento; não é uma profissão, uma promessa de renda ou uma obrigação de aceitar propostas.",
    updated: "2026-09-07",
    sections: [
      {
        id: "significado", heading: "O que é ser sugar baby?",
        paragraphs: [
          "Uma sugar baby pode valorizar maturidade, companhia, experiências compartilhadas ou generosidade em uma relação. As prioridades variam de pessoa para pessoa e precisam ser conversadas com clareza. O rótulo não define personalidade, aparência nem o papel de alguém dentro de um casal.",
          "Apesar da palavra baby, estamos falando exclusivamente de pessoas maiores de 18 anos. Na SugarMimo, o cadastro deve representar uma pessoa real e adulta, com informações verdadeiras e imagens próprias.",
        ],
      },
      {
        id: "perfil", heading: "Como criar um perfil sugar baby na SugarMimo",
        paragraphs: [
          "Comece pela categoria que corresponde ao seu perfil. Preencha as informações solicitadas, descreva seus interesses e envie as fotos exigidas no cadastro. Perfis Sugar Baby passam por análise da equipe; o andamento e eventuais pedidos de correção aparecem na área da conta.",
          "Na descrição pública, fale sobre gostos, disponibilidade e o tipo de conexão que deseja. Evite publicar telefone, endereço, rotina detalhada, local de trabalho ou documentos. Escolha fotos que você se sinta confortável em compartilhar, sem expor outras pessoas sem autorização.",
          "Uma apresentação pode ser simples: “Gosto de gastronomia, cinema e conversas tranquilas. Procuro conhecer alguém com disponibilidade para encontros planejados e respeito à minha privacidade.” Adapte o texto à sua experiência, sem inventar interesses para agradar.",
        ],
      },
      {
        id: "conversas", heading: "Como conversar com um sugar daddy ou uma sugar mommy",
        paragraphs: [
          "Observe se a outra pessoa demonstra interesse no que você escreve e se respeita seu ritmo. Pergunte o que ela procura, como prefere organizar encontros e quais expectativas tem sobre contato e exclusividade. Você não precisa concordar com algo para manter a conversa.",
          "Se presentes ou apoio forem mencionados, esclareça o que foi proposto e preserve sua autonomia. Promessas vagas não são garantia de que algo será cumprido. Não organize sua vida financeira contando com uma relação que ainda não conhece.",
        ],
      },
      {
        id: "golpes", heading: "Sinais de alerta em propostas recebidas",
        paragraphs: ["Interrompa a conversa e avalie uma denúncia se aparecerem situações como:"],
        points: [
          "Pedido de PIX, taxa ou compra antecipada para receber um suposto presente.",
          "Solicitação de senha, código recebido por SMS, documento ou acesso à sua conta.",
          "Pressão para enviar imagens íntimas ou abandonar os canais da plataforma imediatamente.",
          "Histórias inconsistentes, ameaças ou insistência depois de um limite claro.",
        ],
      },
      {
        id: "primeiro-encontro", heading: "Do chat ao primeiro encontro",
        paragraphs: [
          "Escolha um lugar público, planeje seu transporte e avise uma pessoa de confiança. Mantenha o celular carregado e recursos para voltar por conta própria. Uma proposta de luxo não deve substituir os cuidados básicos ao conhecer alguém.",
          "Na plataforma, você pode controlar fotos e contatos privados, bloquear e denunciar. Esses recursos ajudam, mas não eliminam todos os riscos. O fato de um membro pagar um plano não confirma renda nem garante uma relação segura.",
        ],
      },
    ],
    questions: [
      { question: "Quanto ganha uma sugar baby?", answer: "Não existe remuneração fixa ou renda garantida. A SugarMimo é uma plataforma de relacionamentos e não oferece emprego, salário ou promessa de ganhos aos membros." },
      { question: "Preciso divulgar meu contato no perfil?", answer: "Não publique contatos pessoais na descrição pública. Use os controles da plataforma e compartilhe informações apenas quando se sentir confortável." },
      { question: "Meu perfil aparece imediatamente?", answer: "Perfis Sugar Baby passam por análise. A conta informa o status e se a equipe precisa de ajustes; não há aprovação garantida pelo preenchimento do cadastro." },
    ],
    related: [
      { href: "/relacionamento-sugar", label: "Entenda o relacionamento sugar" },
      { href: "/sugar-daddy", label: "Conheça a categoria sugar daddy" },
      { href: "/blog/seguranca-no-primeiro-encontro", label: "Cuidados no primeiro encontro" },
    ],
  },
  {
    slug: "sugar-daddy", label: "Sugar daddy",
    title: "Sugar daddy: o que é e como conhecer pessoas | SugarMimo",
    description: "Entenda o significado de sugar daddy, a diferença para sugar mommy e como usar a SugarMimo com clareza, discrição e respeito aos limites.",
    intro: "Sugar daddy é um homem adulto que se identifica com uma dinâmica de relacionamento sugar, frequentemente associada a maturidade, generosidade e experiências compartilhadas. O termo não comprova patrimônio nem define um valor que alguém deve oferecer.",
    updated: "2026-09-07",
    sections: [
      {
        id: "significado", heading: "O que significa sugar daddy?",
        paragraphs: [
          "A expressão costuma ser usada por pessoas estabelecidas que desejam conhecer uma sugar baby e conversar de forma direta sobre expectativas. Pode haver interesse em companhia, convivência, viagens ou presentes voluntários, conforme as escolhas de cada casal.",
          "Uma relação não se torna compatível apenas porque alguém se apresenta como daddy. Disponibilidade, interesses em comum, honestidade e respeito por limites precisam ser observados nas conversas e nas atitudes.",
        ],
      },
      {
        id: "mommy", heading: "Qual é a diferença entre sugar daddy e sugar mommy?",
        paragraphs: [
          "Sugar mommy é o termo usado por uma mulher adulta que se identifica com essa dinâmica. As expressões daddy e mommy dizem respeito à forma como a pessoa se apresenta; não determinam a orientação sexual nem tornam uma pessoa responsável por decidir pela outra.",
          "Na SugarMimo, escolha a categoria e as preferências que correspondem a você. Informações de perfil ajudam a iniciar uma conversa, mas não substituem conhecer a pessoa e confirmar se os objetivos estão alinhados.",
        ],
      },
      {
        id: "cadastro", heading: "Como começar como sugar daddy na SugarMimo",
        paragraphs: [
          "Crie sua conta com informações verdadeiras, escolha fotos próprias e descreva interesses e disponibilidade. Uma apresentação clara ajuda mais do que promessas sobre dinheiro ou um estilo de vida que você não pretende compartilhar.",
          "Você pode escrever, por exemplo: “Valorizo boa conversa e discrição. Tenho interesse em conhecer alguém que goste de cultura e encontros planejados.” Complete com detalhes reais sobre sua rotina, preservando informações que não devem ser públicas.",
          "Consulte os planos para entender quais funções estão incluídas no seu acesso. Assinatura, destaque e outros recursos do site não garantem mensagens, encontros ou compatibilidade com outro membro.",
        ],
      },
      {
        id: "abordagem", heading: "Como abordar uma sugar baby com respeito",
        paragraphs: [
          "Leia a apresentação antes de iniciar contato. Faça uma pergunta relacionada a um interesse em comum e deixe espaço para a pessoa escolher se quer responder. Evite mensagens repetidas, pressa para obter contato pessoal e cobranças por atenção.",
          "Converse sobre disponibilidade, expectativas, privacidade e limites antes de fazer planos. Generosidade não confere controle sobre fotos, amizades, trabalho ou decisões da outra pessoa. Um convite ou presente pode ser recusado.",
        ],
      },
      {
        id: "privacidade", heading: "Discrição também exige cuidado",
        paragraphs: [
          "Não compartilhe documentos, credenciais, informações bancárias ou detalhes do seu patrimônio no chat. Evite transferências motivadas por urgências de alguém que acabou de conhecer e desconfie de links que peçam uma nova senha para entrar na SugarMimo.",
          "Planeje os primeiros encontros em locais públicos. Se houver tentativa de extorsão, ameaça ou perfil suspeito, preserve as mensagens e use denúncia e bloqueio. A equipe pode avaliar condutas na plataforma, mas não garante a identidade ou o comportamento de todos os usuários.",
        ],
      },
    ],
    questions: [
      { question: "Existe uma renda mínima para ser sugar daddy?", answer: "O termo não corresponde a uma certificação de renda. Valores informados por membros não devem ser tratados como prova de patrimônio; consulte as condições de cadastro e dos planos da plataforma." },
      { question: "A assinatura paga pela companhia de alguém?", answer: "Não. A assinatura dá acesso às funcionalidades descritas no plano. Ela não remunera outro membro nem garante encontros ou respostas." },
      { question: "É obrigatório oferecer presentes?", answer: "A SugarMimo não estabelece presentes ou benefícios obrigatórios entre membros. Expectativas particulares precisam ser discutidas livremente e não substituem consentimento." },
    ],
    related: [
      { href: "/sugar-baby", label: "Entenda a categoria sugar baby" },
      { href: "/relacionamento-sugar", label: "Como funciona uma relação sugar" },
      { href: "/blog/comunicacao-em-relacionamentos-saudaveis", label: "Comunicação em relacionamentos" },
    ],
  },
  {
    slug: "como-funciona", label: "Como funciona",
    title: "Como funciona a SugarMimo: cadastro, perfis e planos",
    description: "Conheça as etapas da SugarMimo: cadastro de adultos, análise de perfis, busca, chat, fotos privadas e condições dos planos.",
    intro: "A SugarMimo aproxima adultos interessados em relacionamento sugar. O caminho começa no cadastro e continua com os recursos disponíveis para a sua categoria de perfil e seu plano.",
    updated: "2026-09-07",
    sections: [
      { id: "cadastro", heading: "1. Crie uma conta que represente você", paragraphs: ["Escolha sua categoria, informe os dados solicitados e apresente interesses e expectativas. Use informações verdadeiras e fotos próprias. O serviço é exclusivo para pessoas com 18 anos completos ou mais."] },
      { id: "analise", heading: "2. Acompanhe a análise do perfil", paragraphs: ["Perfis Sugar Baby ficam sujeitos à análise da equipe. Fotos também podem passar por moderação. Caso sejam necessários ajustes, confira o motivo na conta e siga as orientações para reenviar as informações. As etapas variam por categoria."] },
      { id: "conhecer", heading: "3. Explore perfis e comece uma conversa", paragraphs: ["Depois da liberação dos recursos da sua conta, utilize busca, filtros e perfis para conhecer pessoas. Leia as apresentações e converse sobre afinidades antes de compartilhar contatos ou planejar um encontro."] },
      { id: "planos", heading: "4. Confira os recursos do seu plano", paragraphs: ["Mensagens, destaques e funcionalidades podem depender da categoria e de uma assinatura ativa. Confira preço, duração e condições na página de planos e no checkout antes de pagar. Um plano oferece funcionalidades; não garante respostas ou encontros."] },
      { id: "controle", heading: "5. Mantenha controle sobre a sua experiência", paragraphs: ["Gerencie o perfil, fotos e informações privadas na sua conta. Denúncia, bloqueio e atendimento estão disponíveis para relatar problemas. Consulte as configurações e a Política de Privacidade para pedidos relacionados aos seus dados e à exclusão da conta."] },
    ],
    questions: [
      { question: "Todos os perfis têm os mesmos recursos?", answer: "Não. Funcionalidades e condições dependem da categoria de perfil, do status da conta e do plano. Confira as informações exibidas na própria plataforma." },
      { question: "Onde posso pedir ajuda?", answer: "Use a página de Atendimento ou Fale conosco. Os canais oficiais também estão no rodapé; nunca compartilhe senhas ou códigos recebidos com outro usuário." },
    ],
    related: [{ href: "/planos", label: "Consultar planos" }, { href: "/atendimento", label: "Atendimento e solicitações" }, { href: "/seguranca", label: "Segurança e privacidade" }],
  },
  {
    slug: "seguranca", label: "Segurança",
    title: "Segurança na SugarMimo: privacidade, bloqueio e denúncias",
    description: "Veja como proteger seus dados na SugarMimo, reconhecer abordagens suspeitas e usar fotos privadas, bloqueio, denúncias e atendimento.",
    intro: "Conhecer pessoas exige cuidado dentro e fora da plataforma. A SugarMimo combina regras de comunidade, moderação e controles de privacidade com orientações para que cada adulto preserve sua autonomia.",
    updated: "2026-09-07",
    sections: [
      { id: "dados", heading: "Proteja fotos e informações pessoais", paragraphs: ["Use fotos próprias que não revelem documentos, placas, endereço ou outras informações desnecessárias. Recursos de fotos e contatos privados permitem decidir quando compartilhar. Considere que uma pessoa com acesso a uma imagem pode fazer uma cópia; não existe proteção absoluta contra isso.", "Nunca compartilhe sua senha ou códigos de verificação. Para entrar na conta, use o endereço oficial sugarmimo.com e desconfie de páginas parecidas enviadas por outros membros."] },
      { id: "denuncias", heading: "Quando usar denúncia e bloqueio", paragraphs: ["Denuncie perfis suspeitos, ameaças, assédio, indícios de menoridade ou pedidos incompatíveis com as regras. Bloquear ajuda a interromper o contato. A equipe avalia denúncias e pode aplicar medidas de moderação conforme os Termos de Uso.", "Anote o usuário e preserve as mensagens relevantes. Envie informações pelo Atendimento ou pelo canal oficial de denúncias indicado no rodapé, sem publicar dados pessoais em redes sociais."] },
      { id: "golpes", heading: "Pedidos que merecem atenção", paragraphs: ["Não pague taxas para liberar presentes prometidos por alguém que acabou de conhecer. Não empreste sua conta, não instale programas a pedido de um membro e não envie documentos por chat. Pressão e urgência não devem substituir uma avaliação cuidadosa."] },
      { id: "encontros", heading: "Planeje os primeiros encontros", paragraphs: ["Prefira lugares públicos, avise uma pessoa de confiança e tenha seu próprio transporte. Um plano pago ou perfil moderado não é garantia de conduta. Você pode sair de um encontro ou encerrar uma conversa a qualquer momento."] },
      { id: "regras", heading: "Conheça as regras e os canais oficiais", paragraphs: ["A plataforma é exclusiva para adultos e proíbe exploração, coerção, fraude e uso indevido de dados. Os Termos de Uso e a Política de Privacidade explicam as condições do serviço, os procedimentos de moderação e os canais para solicitações sobre dados pessoais."] },
    ],
    questions: [{ question: "A moderação elimina todos os riscos?", answer: "Não. Moderação e controles ajudam a reduzir riscos, mas não garantem a identidade, a intenção ou o comportamento futuro de cada membro." }],
    related: [{ href: "/atendimento", label: "Registrar uma solicitação" }, { href: "/privacy", label: "Política de Privacidade" }, { href: "/blog/seguranca-no-primeiro-encontro", label: "Guia do primeiro encontro" }],
  },
];

export function getPublicGuide(slug: string) {
  const guide = publicGuides.find((item) => item.slug === slug);
  if (!guide) throw new Error(`Guia público não encontrado: ${slug}`);
  return guide;
}
