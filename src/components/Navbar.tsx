"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  NotebookTabs,
  Package,
  ReceiptText,
  ShoppingCart,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// Menu Navigasi Pembeli (Default)
const CUSTOMER_ITEMS: NavItem[] = [
  { label: "Beranda", href: "/", icon: Home },
  { label: "Keranjang", href: "/keranjang", icon: ShoppingCart },
  { label: "Pesanan", href: "/pesanan", icon: ReceiptText },
];

// Menu Navigasi Admin (Pesanan, Produk, Transaksi)
const ADMIN_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: Home },
  { label: "Pesanan", href: "/admin/pesanan", icon: NotebookTabs },
  { label: "Produk", href: "/admin/produk", icon: Package },
  { label: "Transaksi", href: "/admin/transaksi", icon: ReceiptText },
];

interface NavbarProps {
  items?: NavItem[];
}

export default function Navbar({ items }: NavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  // Otomatis aktifkan menu admin jika mengakses rute /admin atau jika props items diisi
  const isAdminRoute = pathname.startsWith("/admin");
  const navItems = items || (isAdminRoute ? ADMIN_ITEMS : CUSTOMER_ITEMS);

  return (
    <nav
      className="
        w-full 
        bg-white
        fixed 
        bottom-0 
        left-0 
        right-0 
        z-50 
        h-16 
        flex 
        items-center 
        justify-between 
        px-6 
        border-t 
        border-white/10
        shadow-[0_-4px_12px_rgba(0,0,0,0.05)]
        md:bg-primary
        md:sticky 
        md:top-0 
        md:bottom-auto 
        md:border-t-0 
        md:border-b 
        md:grid
        md:grid-cols-3
        md:px-8
        transition-all 
        duration-300
      "
    >
      {/* Brand Logo - Hanya muncul di Desktop (Kolom 1) */}
      <div className="hidden md:flex items-center">
        <span className="font-rubik text-lg font-bold tracking-tight text-white">
          {process.env.NEXT_PUBLIC_SHOP_NAME || "BarangBekas29"}
        </span>
      </div>

      {/* Navigasi Links - Tengah (Kolom 2) */}
      <div className="w-full md:w-auto mx-auto md:flex md:justify-center">
        <ul className="flex items-center justify-around md:justify-center gap-8 md:gap-8 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Pengecekan active tab secara presisi
            const isActive = pathname === item.href;

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-0.5 group"
                >
                  {/* Mobile Icon (Sembunyi di Desktop) */}
                  <div
                    className={`
                      flex 
                      items-center 
                      justify-center 
                      py-1 
                      px-4 
                      rounded-full 
                      transition-all 
                      duration-200 
                      md:hidden
                      ${
                        isActive
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-sky-600 hover:text-primary"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Mobile Text (Sembunyi di Desktop) */}
                  <span
                    className={`
                      text-[10px] 
                      md:hidden 
                      font-semibold 
                      transition-colors 
                      ${isActive ? "text-primary font-bold" : "text-sky-600"}
                    `}
                  >
                    {item.label}
                  </span>

                  {/* Desktop Text-Only (Sembunyi di Mobile) */}
                  <span
                    className={`
                      hidden 
                      md:inline 
                      text-sm 
                      font-semibold 
                      py-1 
                      px-1 
                      border-b-2 
                      transition-all 
                      duration-200
                      ${
                        isActive
                          ? "text-white border-white"
                          : "text-sky-100 border-transparent hover:text-white hover:border-white/30"
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Kolom 3 Kosong - Menyeimbangkan agar menu di Kolom 2 tepat berada di tengah layar */}
      <div className="hidden md:block"></div>
    </nav>
  );
}
