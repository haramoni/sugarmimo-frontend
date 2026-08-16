export const contact = {
  email: "contato@sugarmimo.com",
  whatsappNumber: "5511997752731",
  whatsappNumber2: "554199071059",
  whatsappDisplay: "(11) 99775-2731",
  whatsappMessage: "Olá, gostaria de informações sobre Sugar Mimo",
};

export const whatsappUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(contact.whatsappMessage)}`;
export const whatsappUrl2 = `https://wa.me/${contact.whatsappNumber2}?text=${encodeURIComponent(contact.whatsappMessage)}`;

export const PREMIERE_PIX_KEY = "68573395000155";
export const PREMIERE_PIX_KEY_DISPLAY = "68.573.395/0001-55";

export const premierePaymentWhatsappUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent("Olá! Realizei o pagamento do Premiere da SugarMimo e gostaria de enviar o comprovante para confirmar minha vaga.")}`;
