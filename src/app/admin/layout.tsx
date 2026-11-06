"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Settings, LogOut, Store } from "lucide-react";
import { brand } from "@/lib/brand";

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Collections", href: "/admin/collections", icon: FolderTree },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Login page renders without the admin shell
  if (pathname === "/admin/login") return <>{children}</>;

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-[#f6f7f5]">
      {/* sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-white md:flex">
        <div className="border-b px-6 py-5">
          <Image src={brand.logo.wordmark} alt={brand.name} width={brand.logo.width} height={brand.logo.height} className="h-12 w-auto" />
          <p className="mt-1 text-xs uppercase tracking-wide text-ink-soft">Admin</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  active ? "bg-mint text-mint-deep" : "text-ink-soft hover:bg-mint/40 hover:text-ink"
                }`}
              >
                <n.icon size={18} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t p-4">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-ink-soft hover:bg-mint/40">
            <Store size={18} /> View store
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-wine hover:bg-wine/10">
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>

      {/* mobile topbar */}
      <div className="flex w-full flex-col">
        <div className="flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
          <span className="flex items-center gap-2">
            <Image src={brand.logo.wordmark} alt={brand.name} width={brand.logo.width} height={brand.logo.height} className="h-9 w-auto" />
            <span className="text-xs uppercase tracking-wide text-ink-soft">Admin</span>
          </span>
          <button onClick={logout} className="text-wine"><LogOut size={18} /></button>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b bg-white px-2 py-2 md:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium text-ink-soft">
              {n.label}
            </Link>
          ))}
        </div>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
