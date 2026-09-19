'use client';

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDownToLine, ChartNoAxesCombined, CircleHelp, MousePointer2, RefreshCw, Users, Wallet } from 'lucide-react';
import { METRIC_ACTION_LABELS, METRIC_PAGE_LABELS, METRIC_SOURCE_LABELS, type Breakdown, type MetricsReport } from '@/lib/metrics';
import styles from './metrics.module.css';

const number = new Intl.NumberFormat('pt-BR');
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const roles: Record<string, string> = { SUGAR_BABY: 'Sugar Babies', SUGAR_DADDY: 'Sugar Daddies', SUGAR_MOMMY: 'Sugar Mommies', OTHER: 'Outros perfis' };
const paymentKinds: Record<string, string> = { membership: 'Assinaturas', premiere: 'Premiere', priority: 'Análise prioritária' };
const dateLabel = (date: string) => date.split('-').reverse().join('/');

function defaultPeriod(days = 30) {
  const today = new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 10);
  return { from: new Date(new Date(`${today}T12:00:00Z`).getTime() - (days - 1) * 86400000).toISOString().slice(0, 10), to: today };
}

export default function MetricsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState(() => defaultPeriod());
  const [draft, setDraft] = useState(period);
  const [report, setReport] = useState<MetricsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [chartMetric, setChartMetric] = useState<'registrations' | 'pageViews' | 'revenue'>('registrations');

  const load = useCallback(async (signal: AbortSignal) => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/admin/metrics?${new URLSearchParams(period)}`, { signal, cache: 'no-store' });
      if (response.status === 401 || response.status === 403) { router.push('/admin/login'); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data?.message === 'string' ? data.message : 'Não foi possível carregar as métricas.');
      if (!signal.aborted) setReport(data as MetricsReport);
    } catch (cause) {
      if (!signal.aborted) setError(cause instanceof Error ? cause.message : 'Não foi possível carregar as métricas.');
    } finally { if (!signal.aborted) setLoading(false); }
  }, [period, router]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [load, revision]);

  function apply(event: FormEvent) {
    event.preventDefault();
    setPeriod({ ...draft });
  }

  function preset(days: number) {
    const next = defaultPeriod(days);
    setDraft(next); setPeriod(next);
  }

  const ready = !loading && !error && report && report.period.from === period.from && report.period.to === period.to;
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}><ChartNoAxesCombined size={16} /> VISÃO DO NEGÓCIO</p>
          <h1>Métricas</h1>
          <p className={styles.subtitle}>Acompanhe o crescimento e os resultados da SugarMimo.</p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={() => setRevision((value) => value + 1)} disabled={loading} aria-label="Atualizar métricas"><RefreshCw size={17} className={loading ? styles.spin : undefined} /></button>
          <button type="button" className={styles.primary} disabled={!ready} onClick={() => report && exportReport(report)}><ArrowDownToLine size={17} /> Exportar CSV</button>
        </div>
      </div>

      <section className={styles.filters} aria-label="Período do relatório">
        <div className={styles.presets}>{[7, 30, 90].map((days) => {
          const value = defaultPeriod(days);
          return <button key={days} type="button" aria-pressed={period.from === value.from && period.to === value.to} onClick={() => preset(days)}>Últimos {days} dias</button>;
        })}</div>
        <form onSubmit={apply} className={styles.dates}>
          <label>De<input required type="date" value={draft.from} min="2020-01-01" max={draft.to} onChange={(event) => setDraft({ ...draft, from: event.target.value })} /></label>
          <label>Até<input required type="date" value={draft.to} min={draft.from} max={defaultPeriod().to} onChange={(event) => setDraft({ ...draft, to: event.target.value })} /></label>
          <button className={styles.secondary} type="submit">Aplicar</button>
        </form>
      </section>

      {loading && <div role="status" className={styles.state}><RefreshCw size={24} className={styles.spin} /><p>Preparando seu relatório…</p></div>}
      {!loading && error && <div role="alert" className={styles.error}><p>{error}</p><button type="button" className={styles.secondary} onClick={() => setRevision((value) => value + 1)}>Tentar novamente</button></div>}

      {ready && <>
        <div className={styles.periodLine}>
          <span>{dateLabel(report.period.from)} — {dateLabel(report.period.to)} · Horário de Brasília</span>
          <span>Atualizado às {new Date(report.generatedAt).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className={styles.cards}>
          <MetricCard title="Novos cadastros" value={number.format(report.accounts.registrations)} icon={<Users size={19} />} detail="Contas criadas no período" />
          <MetricCard title="Usuários com atividade" value={number.format(report.activity.active)} icon={<ChartNoAxesCombined size={19} />} detail="Contas únicas com atividade registrada" />
          <MetricCard title="Receita confirmada" value={currency.format(report.payments.revenue)} icon={<Wallet size={19} />} detail={`${number.format(report.payments.count)} pagamentos · exclui estornos`} featured />
          <MetricCard title="Cliques nos links principais" value={report.trackingSince ? number.format(report.traffic.clicks) : '—'} icon={<MousePointer2 size={19} />} detail="Cadastro, entrada, planos, pagamento e atendimento" />
        </div>

        <section className={styles.panel} aria-labelledby="evolution-title">
          <div className={styles.panelHead}>
            <div><p className={styles.eyebrow}>AO LONGO DO TEMPO</p><h2 id="evolution-title">Evolução diária</h2></div>
            <label className={styles.chartSelect}>Indicador<select value={chartMetric} onChange={(event) => setChartMetric(event.target.value as typeof chartMetric)}>
              <option value="registrations">Novos cadastros</option><option value="pageViews">Páginas vistas</option><option value="revenue">Receita confirmada</option>
            </select></label>
          </div>
          <DailyChart report={report} metric={chartMetric} />
          <details className={styles.details}><summary>Ver valores por dia</summary>
            <div className={styles.tableWrap}><table><caption>Indicadores diários do período selecionado</caption><thead><tr><th>Data</th><th>Cadastros</th><th>Usuários ativos</th><th>Navegadores</th><th>Páginas vistas</th><th>Cliques</th><th>Receita</th></tr></thead><tbody>
              {report.daily.map((day) => <tr key={day.date}><td>{dateLabel(day.date)}</td><td>{number.format(day.registrations)}</td><td>{number.format(day.active)}</td><td>{number.format(day.visitors)}</td><td>{number.format(day.pageViews)}</td><td>{number.format(day.clicks)}</td><td>{currency.format(day.revenue)}</td></tr>)}
            </tbody></table></div>
          </details>
        </section>

        <section className={styles.panel} aria-labelledby="traffic-title">
          <div className={styles.panelHead}><div><p className={styles.eyebrow}>AUDIÊNCIA</p><h2 id="traffic-title">Visitas e navegação</h2></div><span className={styles.badge}>Com aceite de cookies</span></div>
          <p className={styles.notice}>{report.trackingSince ? `Primeiro registro em ${new Date(report.trackingSince).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}. Períodos anteriores não têm dados de navegação.` : 'A coleta está pronta. Os primeiros números aparecerão quando visitantes aceitarem os cookies de análise e navegarem no site.'}</p>
          <div className={styles.statsRow}>
            <SmallStat label="Navegadores únicos" value={number.format(report.traffic.visitors)} detail="Estimativa de visitantes" />
            <SmallStat label="Sessões" value={number.format(report.traffic.sessions)} detail="Nova após 30 min de inatividade" />
            <SmallStat label="Páginas vistas" value={number.format(report.traffic.pageViews)} detail="Inclui visitas repetidas" />
            <SmallStat label="Cliques registrados" value={number.format(report.traffic.clicks)} detail="Somente os links monitorados" />
          </div>
        </section>

        <div className={styles.grid}>
          <BreakdownPanel title="Páginas mais vistas" eyebrow="NAVEGAÇÃO" items={report.pages} labels={METRIC_PAGE_LABELS} empty="As páginas aparecerão após as primeiras visitas medidas." />
          <BreakdownPanel title="Origem das sessões" eyebrow="DESCOBERTA" items={report.sources} labels={METRIC_SOURCE_LABELS} empty="A origem será exibida quando houver sessões medidas." />
          <BreakdownPanel title="Cliques por ação" eyebrow="INTERESSE" items={report.clicks} labels={METRIC_ACTION_LABELS} empty="Nenhum clique nos links monitorados neste período." />
          <section className={styles.panel}><p className={styles.eyebrow}>ENGAJAMENTO</p><h2>Atividade no período</h2><div className={styles.rows}>
            <ValueRow label="Entradas na conta" value={number.format(report.activity.logins)} />
            <ValueRow label="Visualizações de perfis" value={number.format(report.activity.profileViews)} />
            <ValueRow label="Ações de curtida" value={number.format(report.activity.likes)} />
            <ValueRow label="Ações de liberação de contato" value={number.format(report.activity.contacts)} />
          </div><p className={styles.footnote}>Ações concluídas registradas pelo sistema. Repetições podem ser contadas.</p></section>
        </div>

        <div className={styles.grid}>
          <section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.eyebrow}>COMUNIDADE</p><h2>Base de usuários</h2></div><span className={styles.badge}>Situação atual</span></div>
            <div className={styles.rows}><ValueRow label="Total de contas" value={number.format(report.accounts.total)} />
              {report.accounts.roles.map((item) => <ValueRow key={item.label} label={roles[item.label] ?? item.label} value={number.format(item.count)} />)}
              <ValueRow label="Perfis aprovados e ativos" value={number.format(report.accounts.approved)} />
              <ValueRow label="Contas com plano / Premium ativo" value={number.format(report.accounts.memberships)} />
            </div><p className={styles.footnote}>Totais atuais, independentes do período. Contas administrativas não entram na contagem.</p>
          </section>
          <section className={styles.panel}><p className={styles.eyebrow}>RESULTADO DO PERÍODO</p><h2>Pagamentos confirmados</h2>
            <div className={styles.rows}>{report.payments.kinds.map((item) => <ValueRow key={item.label} label={`${paymentKinds[item.label]} · ${number.format(item.count)}`} value={currency.format(item.revenue)} />)}
              <ValueRow label="Ticket médio por pagamento" value={currency.format(report.payments.averageTicket)} />
            </div><p className={styles.footnote}>Valores brutos pela data de confirmação, antes das taxas. Cobranças pendentes, estornos e contestações não entram. Planos concedidos manualmente não geram receita.</p>
          </section>
        </div>

        <aside className={styles.method}><CircleHelp size={19} /><div><h2>Como interpretar os números</h2><p>Um navegador pode representar mais de uma pessoa, e uma pessoa pode usar vários navegadores. Recusas de cookies e bloqueadores reduzem a audiência medida. Cliques não significam cadastros ou pagamentos concluídos. Por isso, as bases são apresentadas separadamente, sem uma taxa de conversão que misture pessoas não identificadas.</p><p>Cadastros, atividade e pagamentos usam os registros ainda disponíveis no sistema. Exclusões de contas e de históricos podem alterar relatórios anteriores. O dia atual pode estar incompleto.</p></div></aside>
      </>}
    </main>
  );
}

function MetricCard({ title, value, detail, icon, featured }: { title: string; value: string; detail: string; icon: ReactNode; featured?: boolean }) {
  return <section className={`${styles.card} ${featured ? styles.featured : ''}`}><div className={styles.cardTop}><h2>{title}</h2><span>{icon}</span></div><p className={styles.cardValue}>{value}</p><p className={styles.cardDetail}>{detail}</p></section>;
}
function SmallStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div><p className={styles.statLabel}>{label}</p><p className={styles.statValue}>{value}</p><p className={styles.footnote}>{detail}</p></div>;
}
function ValueRow({ label, value }: { label: string; value: string }) {
  return <div className={styles.valueRow}><span>{label}</span><strong>{value}</strong></div>;
}
function BreakdownPanel({ title, eyebrow, items, labels, empty }: { title: string; eyebrow: string; items: Breakdown[]; labels: Record<string, string>; empty: string }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return <section className={styles.panel}><p className={styles.eyebrow}>{eyebrow}</p><h2>{title}</h2>{items.length ? <ul className={styles.breakdown}>{items.map((item) => <li key={item.label}><div><span>{labels[item.label] ?? item.label}</span><strong>{number.format(item.count)}</strong></div><div className={styles.track} aria-hidden><span style={{ width: `${item.count / max * 100}%` }} /></div></li>)}</ul> : <p className={styles.empty}>{empty}</p>}</section>;
}
function DailyChart({ report, metric }: { report: MetricsReport; metric: 'registrations' | 'pageViews' | 'revenue' }) {
  const maximum = Math.max(1, ...report.daily.map((day) => day[metric]));
  const format = (value: number) => metric === 'revenue' ? currency.format(value) : number.format(value);
  const chartLabel = { registrations: 'Novos cadastros', pageViews: 'Páginas vistas', revenue: 'Receita confirmada' }[metric];
  const width = 900, height = 210, left = metric === 'revenue' ? 108 : 55, right = 16, top = 16, bottom = 32;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const barWidth = plotWidth / report.daily.length;
  const ticks = [...new Set([0, Math.round(maximum / 2), maximum])];
  const labelIndexes = [...new Set([0, Math.floor((report.daily.length - 1) / 2), report.daily.length - 1])];
  return <div className={styles.chart}><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${chartLabel} de ${dateLabel(report.period.from)} a ${dateLabel(report.period.to)}. Valores detalhados disponíveis abaixo.`}>
    {ticks.map((tick) => { const y = top + plotHeight - tick / maximum * plotHeight; return <g key={tick}><line x1={left} y1={y} x2={width - right} y2={y} stroke="#e9e7e2" strokeDasharray={tick ? '4 5' : undefined} /><text x={left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#817b71">{format(tick)}</text></g>; })}
    {report.daily.map((day, index) => { const h = day[metric] / maximum * plotHeight; return <rect key={day.date} x={left + index * barWidth + barWidth * .15} y={top + plotHeight - h} width={Math.max(.5, barWidth * .7)} height={h} rx={Math.min(3, barWidth * .15)} fill="#21735f"><title>{dateLabel(day.date)}: {format(day[metric])}</title></rect>; })}
    {labelIndexes.map((index) => <text key={index} x={left + (index + .5) * barWidth} y={height - 9} textAnchor={index === 0 ? 'start' : index === report.daily.length - 1 ? 'end' : 'middle'} fontSize="11" fill="#817b71">{dateLabel(report.daily[index].date).slice(0, 5)}</text>)}
  </svg>{!report.daily.some((day) => day[metric] > 0) && <p className={styles.chartEmpty}>Nenhum registro deste indicador no período.</p>}</div>;
}

function exportReport(report: MetricsReport) {
  const rows: (string | number)[][] = [
    ['SugarMimo — Métricas'], ['Período', report.period.from, report.period.to], ['Fuso horário', report.period.timezone], ['Gerado em', report.generatedAt],
    ['Primeiro registro de navegação', report.trackingSince ?? 'Ainda sem registros'], [], ['Indicador', 'Valor', 'Escopo'],
    ['Novos cadastros', report.accounts.registrations, 'Período'], ['Usuários com atividade', report.activity.active, 'Período'],
    ['Navegadores únicos', report.traffic.visitors, 'Período, com consentimento'], ['Sessões', report.traffic.sessions, 'Período, com consentimento'],
    ['Páginas vistas', report.traffic.pageViews, 'Período, com consentimento'], ['Cliques nos links monitorados', report.traffic.clicks, 'Período, com consentimento'],
    ['Logins', report.activity.logins, 'Período'], ['Visualizações de perfis', report.activity.profileViews, 'Período'], ['Ações de curtida', report.activity.likes, 'Período'], ['Liberações de contato', report.activity.contacts, 'Período'],
    ['Pagamentos confirmados', report.payments.count, 'Período'], ['Receita confirmada (BRL)', report.payments.revenue.toFixed(2).replace('.', ','), 'Bruta, exclui estornos'],
    ['Ticket médio (BRL)', report.payments.averageTicket.toFixed(2).replace('.', ','), 'Período'],
    ['Total de contas', report.accounts.total, 'Situação atual'], ['Aprovados e ativos', report.accounts.approved, 'Situação atual'], ['Planos / Premium ativos', report.accounts.memberships, 'Situação atual'],
    [], ['Data', 'Cadastros', 'Usuários ativos', 'Navegadores únicos', 'Páginas vistas', 'Cliques', 'Receita confirmada (BRL)'],
    ...report.daily.map((day) => [day.date, day.registrations, day.active, day.visitors, day.pageViews, day.clicks, day.revenue.toFixed(2).replace('.', ',')]),
  ];
  for (const [title, items, labels] of [
    ['Páginas mais vistas', report.pages, METRIC_PAGE_LABELS], ['Origem das sessões', report.sources, METRIC_SOURCE_LABELS],
    ['Cliques por ação', report.clicks, METRIC_ACTION_LABELS], ['Base atual por tipo', report.accounts.roles, roles],
  ] as const) { rows.push([], [title, 'Quantidade'], ...items.map((item) => [labels[item.label] ?? item.label, item.count])); }
  rows.push([], ['Pagamentos por tipo', 'Quantidade', 'Receita confirmada (BRL)'], ...report.payments.kinds.map((item) => [paymentKinds[item.label], item.count, item.revenue.toFixed(2).replace('.', ',')]));
  rows.push([], ['Observações', 'Audiência depende de consentimento. Históricos refletem os registros disponíveis. Valores brutos antes de taxas, excluindo estornos e contestações. Totais atuais não são históricos. Usuários únicos por dia não devem ser somados para calcular usuários únicos do período.']);
  const csv = '\ufeff' + rows.map((row) => row.map((value) => `"${String(value).replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `sugarmimo-metricas-${report.period.from}-${report.period.to}.csv`; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
