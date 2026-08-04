export const contact = {
  whatsappNumber: "551199775-2731",
  whatsappMessage: "Olá, gostaria de informações sobre Sugar Mimo",
};

export const whatsappUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(contact.whatsappMessage)}`;
