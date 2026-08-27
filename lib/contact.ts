export const contact = {
  email: "contato@sugarmimo.com",
  privacyEmail: "privacidade@sugarmimo.com",
  securityEmail: "denuncia@sugarmimo.com",
  whatsappNumber: "5511997752731",
  whatsappNumber2: "554199071059",
  whatsappDisplay: "(11) 99775-2731",
  whatsappMessage: "Olá, gostaria de informações sobre Sugar Mimo",
};

export const whatsappUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(contact.whatsappMessage)}`;
export const whatsappUrl2 = `https://wa.me/${contact.whatsappNumber2}?text=${encodeURIComponent(contact.whatsappMessage)}`;

export const PREMIERE_PIX_KEY = "68573395000155";
export const PREMIERE_PIX_KEY_DISPLAY = "68.573.395/0001-55";
export const PREMIERE_ORIGINAL_PRICE_DISPLAY = "R$ 200,00";
export const PREMIERE_PRICE_DISPLAY = "R$ 149,00";
export const PREMIERE_PIX_AMOUNT = "149.00";
export const APPROVAL_PRIORITY_PRICE_DISPLAY = "R$ 30,00";
export const APPROVAL_PRIORITY_PIX_AMOUNT = "30.00";

function pixField(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function pixCrc16(value: string) {
  let crc = 0xffff;

  for (let index = 0; index < value.length; index += 1) {
    crc ^= value.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function createPixPayload(amount: string) {
  const merchantAccount =
    pixField("00", "br.gov.bcb.pix") + pixField("01", PREMIERE_PIX_KEY);
  const additionalData = pixField("05", "***");
  const payload =
    pixField("00", "01") +
    pixField("01", "11") +
    pixField("26", merchantAccount) +
    pixField("52", "0000") +
    pixField("53", "986") +
    pixField("54", amount) +
    pixField("58", "BR") +
    pixField("59", "SPARKBRIDGE VENTURES") +
    pixField("60", "JUNDIAI") +
    pixField("62", additionalData) +
    "6304";

  return `${payload}${pixCrc16(payload)}`;
}

export const PREMIERE_PIX_COPY_PASTE = createPixPayload(PREMIERE_PIX_AMOUNT);
export const APPROVAL_PRIORITY_PIX_COPY_PASTE = createPixPayload(
  APPROVAL_PRIORITY_PIX_AMOUNT,
);

export const premierePaymentWhatsappUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(`Olá! Realizei o pagamento de ${PREMIERE_PRICE_DISPLAY} do Premiere da SugarMimo e gostaria de enviar o comprovante para confirmar minha vaga.`)}`;

export function approvalPriorityPaymentWhatsappUrl(username?: string) {
  const profile = username?.trim() ? ` @${username.trim()}` : "";
  const message = `Olá! Realizei o pagamento de ${APPROVAL_PRIORITY_PRICE_DISPLAY} pela análise prioritária do perfil${profile} na SugarMimo e gostaria de enviar o comprovante. Estou ciente de que o pagamento prioriza a análise, mas não garante a aprovação.`;

  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
