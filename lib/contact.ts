export const contact = {
  whatsappNumber: "5511997752731",
  whatsappMessage: "Olá, gostaria de informações sobre Sugar Mimo",
};

export const whatsappUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(contact.whatsappMessage)}`;
