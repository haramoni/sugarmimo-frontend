export const contact = {
  email: "comercial@prospectshouse.com",
  whatsappDisplay: "(11) 98610-6525",
  whatsappNumber: "5511986106525",
  whatsappMessage:
    "Olá! Gostaria de conversar sobre geração de demanda para minha empresa.",
};

export const whatsappUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(contact.whatsappMessage)}`;
