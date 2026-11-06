import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SmoothScroll } from "@/components/SmoothScroll";
import { getSettings, getCollections } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [settings, collections] = await Promise.all([getSettings(), getCollections()]);
  return (
    <>
      <SmoothScroll />
      <Header settings={settings} collections={collections} />
      <CartDrawer />
      <main>{children}</main>
      <Footer settings={settings} collections={collections} />
      <WhatsAppButton whatsapp={settings.whatsapp} />
    </>
  );
}
