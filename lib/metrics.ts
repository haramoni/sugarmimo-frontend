export const METRIC_PAGE_LABELS: Record<string, string> = {
  home: 'Página inicial', register: 'Cadastro', login: 'Entrar', plans: 'Planos',
  checkout: 'Pagamento', about: 'Sobre', how_it_works: 'Como funciona',
  safety: 'Segurança', contact: 'Contato e atendimento', blog: 'Blog',
  guides: 'Guias', members: 'Início dos membros', search: 'Busca', profile: 'Perfis',
  chat: 'Chat', pins: 'Pins', notifications: 'Notificações', settings: 'Configurações',
  vip: 'Clube VIP', affiliates: 'Afiliadas', invite: 'Convites', privacy: 'Privacidade', terms: 'Termos',
};
export const METRIC_ACTION_LABELS: Record<string, string> = {
  register: 'Criar conta', login: 'Entrar', plans: 'Ver planos',
  checkout: 'Ir para pagamento', whatsapp_support: 'WhatsApp do atendimento',
};
export const METRIC_SOURCE_LABELS: Record<string, string> = {
  direct: 'Direto / origem indisponível', internal: 'Navegação interna', google: 'Google',
  bing: 'Bing', instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', other: 'Outros sites',
};

const PAGE_ROUTES: Record<string, string> = {
  register: 'register', login: 'login', planos: 'plans', checkout: 'checkout', sobre: 'about',
  'como-funciona': 'how_it_works', seguranca: 'safety', contato: 'contact', atendimento: 'contact',
  blog: 'blog', 'relacionamento-sugar': 'guides', 'sugar-baby': 'guides', 'sugar-daddy': 'guides',
  inicio: 'members', buscar: 'search', perfil: 'profile', chat: 'chat', pins: 'pins',
  notificacoes: 'notifications', configuracoes: 'settings', 'clube-vip': 'vip', afiliadas: 'affiliates',
  convite: 'invite', privacy: 'privacy', terms: 'terms',
};

export function metricPage(pathname: string) {
  if (pathname === '/') return 'home';
  return PAGE_ROUTES[pathname.split('/')[1]] ?? null;
}

export function metricSource(referrer: string, origin: string) {
  if (!referrer) return 'direct';
  try {
    const url = new URL(referrer);
    if (url.origin === origin || /(^|\.)sugarmimo\.com$/i.test(url.hostname)) return 'internal';
    if (/(^|\.)google\.(com|com\.br|[a-z]{2})$/i.test(url.hostname)) return 'google';
    for (const name of ['bing', 'instagram', 'facebook', 'tiktok']) {
      if (url.hostname === `${name}.com` || url.hostname.endsWith(`.${name}.com`)) return name;
    }
    return 'other';
  } catch { return 'direct'; }
}

export type MetricsReport = {
  period: { from: string; to: string; timezone: string };
  generatedAt: string;
  trackingSince: string | null;
  accounts: { total: number; registrations: number; approved: number; memberships: number; roles: Breakdown[] };
  activity: { active: number; logins: number; profileViews: number; likes: number; contacts: number };
  traffic: { visitors: number; sessions: number; pageViews: number; clicks: number };
  payments: { count: number; revenue: number; averageTicket: number; kinds: Array<Breakdown & { revenue: number }> };
  daily: Array<{ date: string; registrations: number; active: number; visitors: number; pageViews: number; clicks: number; revenue: number }>;
  pages: Breakdown[];
  sources: Breakdown[];
  clicks: Breakdown[];
};
export type Breakdown = { label: string; count: number };
