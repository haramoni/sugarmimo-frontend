export const bodyTypes = [
  "Magra",
  "Medio",
  "Musculosa",
  "Em forma",
  "Um pouco acima do peso",
  "Grande e amorosa",
];

export const ethnicities = [
  "Branca/Caucasiano",
  "Parda",
  "Negra/Afrodescendente",
  "Latina/Hispanico",
  "Asiatica japonesa",
  "Asiatica chinesa",
  "Asiatica coreana",
  "Asiatica outras",
  "Indiana",
  "Do Oriente Medio",
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
  "Viuva",
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
  "2 Grau",
  "Tecnico Profissionalizante",
  "Superior Cursando",
  "Superior Incompleto",
  "Superior Completo",
  "Pos-graduado",
  "Ph.D. / Pos-graduado",
  "Escola da Vida!",
];

export const occupationOptions = [
  "Administradora de Empresas",
  "Advogada",
  "Arquiteta",
  "Assistente",
  "Atendente",
  "Autonoma",
  "Cabeleireira",
  "Consultora",
  "Dentista",
  "Diretora de Empresas",
  "Economista",
  "Educadora",
  "Empresaria",
  "Enfermeira",
  "Engenheira",
  "Estagiaria",
  "Esteticista",
  "Estudante",
  "Funcionaria Publica",
  "TI",
  "Jornalista",
  "Medica",
  "Modelo",
  "Recepcionista",
  "Secretaria",
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

export function isMasculineProfile(profileType?: string | null) {
  const normalized = profileType?.trim().toLowerCase();
  return (
    normalized?.startsWith("sugar-daddy") === true ||
    normalized === "sugar-baby-man"
  );
}

export function describeForProfile(
  value: string,
  profileType?: string | null,
) {
  if (!value || !isMasculineProfile(profileType)) {
    return value;
  }

  return masculineDescriptions[normalizeDescription(value)] ?? value;
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
