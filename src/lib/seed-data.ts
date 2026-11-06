import type { StoreData, Product, Collection, Testimonial } from "./types";

/**
 * Sample saree catalogue used to seed the database (scripts/seed-supabase.ts).
 * Photos are free Pexels placeholders in /public/images/sarees (see CREDITS.md there) —
 * replace them, and these listings, with the store's real sarees from the admin panel.
 */
const img = (id: number) => `/images/sarees/${id}.jpg`;

export const collections: Collection[] = [
  { id: "c1", handle: "kanchipuram-silk", title: "Kanchipuram Silk", image: img(10317106), description: "Rich pure-silk sarees with temple borders, made for big days." },
  { id: "c2", handle: "soft-silk", title: "Soft Silk", image: img(35108809), description: "Light, easy-to-drape silks for festivals and functions." },
  { id: "c3", handle: "banarasi", title: "Banarasi", image: img(28943543), description: "Classic Banarasi weaves with fine zari work." },
  { id: "c4", handle: "cotton", title: "Cotton Sarees", image: img(33306356), description: "Breathable everyday sarees, soft and simple." },
  { id: "c5", handle: "party-wear", title: "Party Wear", image: img(7176430), description: "Light, flowing sarees for parties and evenings." },
  { id: "c6", handle: "wedding", title: "Wedding & Bridal", image: img(9419251), description: "Our richest silks for weddings and receptions." },
];

type Seed = {
  title: string;
  images: number[];
  price: number;
  mrp?: number; // original price, shown struck through when on offer
  cols: string[];
  colour: string;
  fabric: string;
  newLaunch?: boolean;
  bestDeal?: boolean;
  restocked?: boolean;
};

// Listed newest first.
const SEEDS: Seed[] = [
  // Kanchipuram silk
  { title: "Sindhooram Kanchipuram Silk Saree", images: [27575104], price: 12499, cols: ["kanchipuram-silk", "wedding"], colour: "purple and pink", fabric: "Kanchipuram silk", newLaunch: true },
  { title: "Manjal Kumkumam Pattu Saree", images: [9419023, 9419251], price: 10999, mrp: 12999, cols: ["kanchipuram-silk", "wedding"], colour: "turmeric yellow and pink", fabric: "pattu silk", newLaunch: true, bestDeal: true },
  { title: "Maambazham Orange Silk Saree", images: [27575174], price: 11499, cols: ["kanchipuram-silk", "wedding"], colour: "mango orange", fabric: "Kanchipuram silk" },
  { title: "Neelam Arakku Silk Saree", images: [29049398], price: 9999, cols: ["kanchipuram-silk", "wedding"], colour: "deep purple with an orange border", fabric: "Kanchipuram silk", restocked: true },
  { title: "Pachai Kili Silk Saree", images: [28054616], price: 8999, mrp: 10499, cols: ["kanchipuram-silk"], colour: "parrot green and silver", fabric: "Kanchipuram silk", bestDeal: true },
  { title: "Rose Gold Kanchi Silk Saree", images: [37602133], price: 9499, cols: ["kanchipuram-silk", "wedding"], colour: "rose pink and gold", fabric: "Kanchipuram silk" },
  { title: "Saffron Temple Border Silk Saree", images: [28943610], price: 7999, cols: ["kanchipuram-silk"], colour: "saffron", fabric: "silk", restocked: true },
  // Soft silk
  { title: "Teal Peacock Soft Silk Saree", images: [35108765, 35108776, 35108778], price: 4499, cols: ["soft-silk", "wedding"], colour: "peacock teal and gold", fabric: "soft silk", newLaunch: true },
  { title: "Pink Lotus Soft Silk Saree", images: [35108809, 35108811], price: 3999, cols: ["soft-silk"], colour: "lotus pink", fabric: "soft silk", newLaunch: true },
  { title: "Blush Pearl Soft Silk Saree", images: [35108820], price: 3499, mrp: 4199, cols: ["soft-silk"], colour: "blush pink", fabric: "soft silk", bestDeal: true },
  { title: "Lavender Mist Soft Silk Saree", images: [35108855], price: 3799, cols: ["soft-silk"], colour: "lavender", fabric: "soft silk", newLaunch: true },
  { title: "Sky and Gold Soft Silk Saree", images: [35108856, 35108861], price: 4299, cols: ["soft-silk"], colour: "sky blue and gold", fabric: "soft silk" },
  { title: "Aqua Bloom Soft Silk Saree", images: [35108863], price: 3999, cols: ["soft-silk"], colour: "aqua with lilac", fabric: "soft silk", restocked: true },
  { title: "Rose Petal Soft Silk Saree", images: [35108807], price: 3299, mrp: 3899, cols: ["soft-silk"], colour: "rose pink", fabric: "soft silk", bestDeal: true },
  { title: "Mint Pink Soft Silk Saree", images: [35108770], price: 3599, cols: ["soft-silk"], colour: "mint and pink", fabric: "soft silk" },
  // Banarasi
  { title: "Sunset Orange Banarasi Saree", images: [28943474, 28943495], price: 6499, cols: ["banarasi"], colour: "sunset orange", fabric: "Banarasi silk", newLaunch: true },
  { title: "Coral Red Banarasi Saree", images: [28943543, 28943531, 28943579], price: 6999, mrp: 7999, cols: ["banarasi", "wedding"], colour: "coral red", fabric: "Banarasi silk", bestDeal: true },
  { title: "Deep Maroon Banarasi Saree", images: [28943676, 28943670], price: 7499, cols: ["banarasi"], colour: "deep maroon", fabric: "Banarasi silk", restocked: true },
  { title: "Olive and Rust Banarasi Saree", images: [28943601], price: 5999, cols: ["banarasi"], colour: "olive green and rust", fabric: "Banarasi silk" },
  // Cotton
  { title: "Chennai Morning Cotton Saree", images: [14205210], price: 1299, cols: ["cotton"], colour: "white with red", fabric: "cotton", newLaunch: true },
  { title: "Kolam White Cotton Saree", images: [33306356], price: 1199, cols: ["cotton"], colour: "white with red stripes", fabric: "cotton" },
  { title: "Pink Ikat Cotton Saree", images: [32711516], price: 1499, mrp: 1799, cols: ["cotton"], colour: "pink and white", fabric: "cotton", bestDeal: true },
  { title: "Red Border Handloom Cotton Saree", images: [39559946], price: 1399, cols: ["cotton"], colour: "white with a red border", fabric: "handloom cotton", restocked: true },
  { title: "Garden Red Cotton Saree", images: [10156154], price: 1099, cols: ["cotton"], colour: "red", fabric: "cotton" },
  { title: "Midnight Black Cotton Saree", images: [33556315], price: 1599, cols: ["cotton"], colour: "black with a red border", fabric: "cotton" },
  { title: "Maroon Weave Cotton Saree", images: [34964322], price: 1399, cols: ["cotton"], colour: "maroon", fabric: "cotton" },
  // Party wear
  { title: "Aqua Chiffon Party Saree", images: [7176430, 7176438], price: 2499, cols: ["party-wear"], colour: "aqua", fabric: "chiffon", newLaunch: true },
  { title: "Magenta Glow Party Saree", images: [33078836], price: 2799, mrp: 3299, cols: ["party-wear"], colour: "magenta", fabric: "georgette", bestDeal: true },
  { title: "Sunflower Party Saree", images: [17876038], price: 2299, cols: ["party-wear"], colour: "sunflower yellow and pink", fabric: "georgette" },
  { title: "Wine Drape Party Saree", images: [11629757], price: 2599, cols: ["party-wear"], colour: "wine red", fabric: "georgette", restocked: true },
  { title: "Ivory Gold Tissue Saree", images: [37054318], price: 3299, cols: ["party-wear", "wedding"], colour: "ivory and gold", fabric: "tissue" },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const products: Product[] = SEEDS.map((s, i) => ({
  id: `s${i + 1}`,
  handle: slug(s.title),
  title: s.title,
  description:
    `A ${s.fabric} saree in ${s.colour}. ` +
    "Message us on WhatsApp for the length, blouse and care details, or to see more photos before you order.",
  price: s.price,
  compareAtPrice: s.mrp,
  images: s.images.map(img),
  collections: s.cols,
  sizes: ["Free Size"],
  tags: [s.fabric, ...s.cols],
  immediateDispatch: false,
  bestDeal: !!s.bestDeal,
  exclusiveDrop: false,
  restocked: !!s.restocked,
  newLaunch: !!s.newLaunch,
  inStock: true,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

// No sample reviews: add real customer reviews in the database when you have them.
export const testimonials: Testimonial[] = [];

export const seedData: StoreData = {
  products,
  collections,
  testimonials,
  settings: {
    storeName: "Mayuri Silks",
    tagline: "Handpicked sarees, wrapped with love",
    supportEmail: "",
    supportPhone: "+91 98765 43210",
    address: "No. 18, Lakshmi Nagar 2nd Street, Tiruppur, Tamil Nadu 641604",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
    whatsapp: "https://wa.me/919876543210",
    facebook: "https://www.facebook.com/",
    whatsappGroup: "https://chat.whatsapp.com/",
    mapsUrl: "https://maps.google.com/",
    freeShippingThreshold: 2499,
    announcement: "Beautiful sarees for every occasion 🌸",
  },
  orders: [],
};
