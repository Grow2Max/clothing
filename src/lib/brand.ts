// Central brand config. Store name/tagline/contact/socials can also be edited live
// in Admin → Settings (those values override the defaults below).
// DEMO: a fictional store. Name, people, phone, address and links are made up.
export const brand = {
  name: "Mayuri Silks",
  tagline: "Handpicked sarees, wrapped with love",
  slogan: "Beautiful sarees for every occasion 🌸",
  founder: { name: "Meera Sundaram", instagram: "https://www.instagram.com/" },
  instagramHandle: "mayuri.silks",
  logo: {
    wordmark: "/brand/logo-wordmark.png", // dark text on transparent (594×201)
    wordmarkLight: "/brand/logo-wordmark-light.png", // light text on transparent, for dark backgrounds
    full: "/brand/logo-full.jpg", // square logo (800×800)
    width: 594,
    height: 201,
  },
  phone: "+91 98765 43210",
  socials: {
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
    facebook: "https://www.facebook.com/",
    whatsapp: "https://wa.me/919876543210",
    whatsappGroup: "https://chat.whatsapp.com/",
  },
  currency: "₹",
  storeAddress: "No. 18, Lakshmi Nagar 2nd Street, Tiruppur, Tamil Nadu 641604",
  mapsUrl: "https://maps.google.com/",
};

/** Turn "+91 98765 43210" into a tel: link. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
