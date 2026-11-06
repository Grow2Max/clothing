export type ProductImage = string;

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number; // original price for "Sale"
  images: ProductImage[];
  collections: string[]; // collection handles
  sizes: string[];
  tags: string[];
  immediateDispatch: boolean;
  bestDeal: boolean;
  exclusiveDrop: boolean;
  restocked: boolean;
  newLaunch: boolean;
  inStock: boolean;
  createdAt: string;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  image: string;
  description?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  image?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  facebook?: string;
  whatsappGroup?: string;
  mapsUrl?: string;
  address: string;
  instagram: string;
  youtube: string;
  whatsapp: string;
  freeShippingThreshold: number;
  announcement: string;
}

export interface StoreData {
  products: Product[];
  collections: Collection[];
  testimonials: Testimonial[];
  orders: Order[];
  settings?: StoreSettings;
}
