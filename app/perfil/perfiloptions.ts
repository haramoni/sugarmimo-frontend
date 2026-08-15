export const bodyTypes = [
  "Magra",
  "Médio",
  "Musculosa",
  "Em forma",
  "Um pouco acima do peso",
  "Grande e amorosa",
];

export const ethnicities = [
  "Branca/Caucasiana",
  "Parda",
  "Negra/Afrodescendente",
  "Latina/Hispânica",
  "Asiática japonesa",
  "Asiática chinesa",
  "Asiática coreana",
  "Asiática — outras",
  "Indiana",
  "Do Oriente Médio",
  "Outros",
];

export const hairColors = [
  "Preto",
  "Castanho",
  "Castanho claro",
  "Loiro",
  "Ruivo",
  "Vermelho",
  "Grisalho",
  "Calvo",
  "Outro",
];

export const eyeColors = [
  "Castanho claro",
  "Castanho escuro",
  "Preto",
  "Azul",
  "Verde",
  "Cinza",
  "Outro",
];

export const smokeOptions = [
  "Nunca",
  "Raramente",
  "Socialmente",
  "Frequentemente",
  "Muito frequentemente",
  "Tentando parar",
  "Parei",
];

export const drinkOptions = [
  "Nunca",
  "Raramente",
  "Socialmente",
  "Regularmente",
  "Frequentemente",
  "Tentando parar",
  "Parei",
];

export const relationshipOptions = [
  "Solteira",
  "Separada",
  "Divorciada",
  "Viúva",
  "Casada, mas procurando",
];

export const childrenOptions = [
  "Nenhum",
  "1 Filho",
  "2 Filhos",
  "3 Filhos",
  "4 Filhos",
  "5 ou mais",
];

export const educationOptions = [
  "2º Grau",
  "Técnico Profissionalizante",
  "Superior Cursando",
  "Superior Incompleto",
  "Superior Completo",
  "Pós-graduado",
  "Ph.D. / Pós-graduado",
  "Escola da Vida!",
];

export const occupationOptions = [
  "Administradora de Empresas",
  "Advogada",
  "Arquiteta",
  "Assistente",
  "Atendente",
  "Autônoma",
  "Cabeleireira",
  "Consultora",
  "Dentista",
  "Diretora de Empresas",
  "Economista",
  "Educadora",
  "Empresária",
  "Enfermeira",
  "Engenheira",
  "Estagiária",
  "Esteticista",
  "Estudante",
  "Funcionária Pública",
  "TI",
  "Jornalista",
  "Médica",
  "Modelo",
  "Recepcionista",
  "Secretária",
  "Vendedora",
  "Outras",
];

const masculineDescriptions: Record<string, string> = {
  magra: "Magro",
  medio: "Médio",
  musculosa: "Musculoso",
  "grande e amorosa": "Grande e amoroso",
  "branca/caucasiano": "Branco/Caucasiano",
  parda: "Pardo",
  "negra/afrodescendente": "Negro/Afrodescendente",
  "latina/hispanico": "Latino/Hispânico",
  "asiatica japonesa": "Asiático japonês",
  "asiatica chinesa": "Asiático chinês",
  "asiatica coreana": "Asiático coreano",
  "asiatica outras": "Asiático — outros",
  indiana: "Indiano",
  solteira: "Solteiro",
  separada: "Separado",
  divorciada: "Divorciado",
  viuva: "Viúvo",
  "casada, mas procurando": "Casado, mas procurando",
  "administradora de empresas": "Administrador de Empresas",
  advogada: "Advogado",
  arquiteta: "Arquiteto",
  autonoma: "Autônomo",
  cabeleireira: "Cabeleireiro",
  consultora: "Consultor",
  "diretora de empresas": "Diretor de Empresas",
  educadora: "Educador",
  empresaria: "Empresário",
  enfermeira: "Enfermeiro",
  engenheira: "Engenheiro",
  estagiaria: "Estagiário",
  "funcionaria publica": "Funcionário Público",
  medica: "Médico",
  secretaria: "Secretário",
  vendedora: "Vendedor",
  outras: "Outros",
};

const canonicalDescriptions: Record<string, string> = {
  medio: "Médio",
  "branca/caucasiano": "Branca/Caucasiana",
  "latina/hispanico": "Latina/Hispânica",
  "asiatica japonesa": "Asiática japonesa",
  "asiatica chinesa": "Asiática chinesa",
  "asiatica coreana": "Asiática coreana",
  "asiatica outras": "Asiática — outras",
  "do oriente medio": "Do Oriente Médio",
  viuva: "Viúva",
  "2 grau": "2º Grau",
  "tecnico profissionalizante": "Técnico Profissionalizante",
  "pos-graduado": "Pós-graduado",
  "ph.d. / pos-graduado": "Ph.D. / Pós-graduado",
  autonoma: "Autônoma",
  empresaria: "Empresária",
  estagiaria: "Estagiária",
  "funcionaria publica": "Funcionária Pública",
  medica: "Médica",
  secretaria: "Secretária",
};

export function isMasculineProfile(profileType?: string | null) {
  const normalized = profileType?.trim().toLowerCase();
  return (
    normalized?.startsWith("sugar-daddy") === true ||
    normalized === "sugar-baby-man" ||
    normalized === "sugar-baby-trans-man"
  );
}

export function describeForProfile(
  value: string,
  profileType?: string | null,
) {
  if (!value) {
    return value;
  }

  const normalizedValue = normalizeDescription(value);

  if (isMasculineProfile(profileType)) {
    return (
      masculineDescriptions[normalizedValue] ??
      canonicalDescriptions[normalizedValue] ??
      value
    );
  }

  return canonicalDescriptions[normalizedValue] ?? value;
}

export function optionsForProfile(
  options: string[],
  profileType?: string | null,
) {
  return options.map((option) => describeForProfile(option, profileType));
}

function normalizeDescription(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
