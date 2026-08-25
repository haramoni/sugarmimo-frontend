import { NextResponse } from "next/server";

import { API_URL } from "../../../auth/_cookies";
import { clearAdminSessionCookie, getAdminSessionToken } from "../../_session";

type ExportProfile = {
  username: string;
  role: string | null;
  lookingFor: string | null;
  age: number | null;
  city: string | null;
  state: string | null;
  approvalStatus: string;
  accountStatus: string;
};

const ROLE_LABELS: Record<string, string> = {
  SUGAR_BABY: "Sugar Baby",
  SUGAR_DADDY: "Sugar Daddy",
};

const LOOKING_FOR_LABELS: Record<string, string> = {
  women: "Mulheres",
  men: "Homens",
  both: "Homens e mulheres",
};

const APPROVAL_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  WAITING: "Em espera",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

const ACCOUNT_LABELS: Record<string, string> = {
  ACTIVE: "Conta ativa",
  SUSPENDED: "Conta suspensa",
  BANNED: "Conta bloqueada",
};

const STATE_REGIONS: Record<string, string> = {
  AC: "Norte",
  AP: "Norte",
  AM: "Norte",
  PA: "Norte",
  RO: "Norte",
  RR: "Norte",
  TO: "Norte",
  PR: "Sul",
  RS: "Sul",
  SC: "Sul",
  DF: "Oeste",
  GO: "Oeste",
  MT: "Oeste",
  MS: "Oeste",
  AL: "Leste",
  BA: "Leste",
  CE: "Leste",
  ES: "Leste",
  MA: "Leste",
  MG: "Leste",
  PB: "Leste",
  PE: "Leste",
  PI: "Leste",
  RJ: "Leste",
  RN: "Leste",
  SE: "Leste",
  SP: "Leste",
};

const STATE_CODES_BY_NAME: Record<string, string> = {
  ACRE: "AC",
  ALAGOAS: "AL",
  AMAPA: "AP",
  AMAZONAS: "AM",
  BAHIA: "BA",
  CEARA: "CE",
  "DISTRITO FEDERAL": "DF",
  "ESPIRITO SANTO": "ES",
  GOIAS: "GO",
  MARANHAO: "MA",
  "MATO GROSSO": "MT",
  "MATO GROSSO DO SUL": "MS",
  "MINAS GERAIS": "MG",
  PARA: "PA",
  PARAIBA: "PB",
  PARANA: "PR",
  PERNAMBUCO: "PE",
  PIAUI: "PI",
  "RIO DE JANEIRO": "RJ",
  "RIO GRANDE DO NORTE": "RN",
  "RIO GRANDE DO SUL": "RS",
  RONDONIA: "RO",
  RORAIMA: "RR",
  "SANTA CATARINA": "SC",
  "SAO PAULO": "SP",
  SERGIPE: "SE",
  TOCANTINS: "TO",
};

export async function GET(request: Request) {
  const token = await getAdminSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const incomingParams = new URL(request.url).searchParams;
  const backendParams = new URLSearchParams();
  for (const key of ["search", "role", "approvalStatus", "accountStatus"]) {
    const value = incomingParams.get(key);
    if (value) backendParams.set(key, value);
  }

  const suffix = backendParams.size ? `?${backendParams.toString()}` : "";
  const response = await fetch(`${API_URL}/admin/profiles-export${suffix}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível gerar o arquivo CSV." },
      { status: 503 },
    );
  }

  if (response.status === 401 || response.status === 403) {
    await clearAdminSessionCookie();
  }

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    return NextResponse.json(
      result ?? { message: "Não foi possível gerar o arquivo CSV." },
      { status: response.status },
    );
  }

  const profiles = Array.isArray(result) ? (result as ExportProfile[]) : [];
  const rows = [
    [
      "Usuário",
      "O que é",
      "O que procura",
      "Região",
      "Idade das meninas",
      "Status",
    ],
    ...profiles.map((profile) => [
      profile.username,
      label(ROLE_LABELS, profile.role),
      label(LOOKING_FOR_LABELS, profile.lookingFor),
      regionFromState(profile.state),
      profile.role === "SUGAR_BABY"
        ? profile.age === null
          ? "SEM DATA CADASTRADA"
          : String(profile.age)
        : "",
      `${label(APPROVAL_LABELS, profile.approvalStatus)} · ${label(ACCOUNT_LABELS, profile.accountStatus)}`,
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="usuarios-sugarmimo-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function label(labels: Record<string, string>, value: string | null) {
  if (!value) return "Não informado";
  return labels[value] ?? value;
}

function csvCell(value: string) {
  const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

function regionFromState(state: string | null) {
  if (!state) return "Não informado";
  const normalized = state
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
  const stateCode = STATE_CODES_BY_NAME[normalized] ?? normalized;
  return STATE_REGIONS[stateCode] ?? "Não informado";
}
