"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, NotebookTabs } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

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
        <span className="font-serif text-lg font-bold tracking-tight text-white">
          {process.env.NEXT_PUBLIC_SHOP_NAME || "BarangBekas29"}
        </span>
      </div>

      {/* Navigasi Links - Tengah (Kolom 2) */}
      <div className="w-full md:w-auto mx-auto md:flex md:justify-center">
        <ul className="flex items-center justify-around md:justify-center gap-12 md:gap-8 w-full">
          <li>
            <Link
              href="/"
              className="flex flex-col items-center justify-center gap-0.5 group"
            >
              {/* Mobile Icon (Sembunyi di Desktop) */}
              <div
                className={`
                  flex 
                  items-center 
                  justify-center 
                  py-1 
                  px-5 
                  rounded-full 
                  transition-all 
                  duration-200 
                  md:hidden
                  ${
                    pathname === "/"
                      ? "bg-primary/10 text-primary"
                      : "text-sky-200 hover:text-white"
                  }
                `}
              >
                <Home className="h-5 w-5" />
              </div>

              {/* Mobile Text (Sembunyi di Desktop) */}
              <span
                className={`
                  text-[10px] 
                  md:hidden 
                  font-semibold 
                  transition-colors 
                  ${pathname === "/" ? "text-primary" : "text-sky-200"}
                `}
              >
                Home
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
                    pathname === "/"
                      ? "text-white border-white"
                      : "text-sky-100 border-transparent hover:text-white hover:border-white/30"
                  }
                `}
              >
                Home
              </span>
            </Link>
          </li>

          <li>
            <Link
              href="/admin"
              className="flex flex-col items-center justify-center gap-0.5 group"
            >
              {/* Mobile Icon (Sembunyi di Desktop) */}
              <div
                className={`
                  flex 
                  items-center 
                  justify-center 
                  py-1 
                  px-5 
                  rounded-full 
                  transition-all 
                  duration-200 
                  md:hidden
                  ${
                    pathname === "/admin"
                      ? "bg-primary/10 text-primary"
                      : "text-sky-600 hover:text-white"
                  }
                `}
              >
                <NotebookTabs className="h-5 w-5" />
              </div>

              {/* Mobile Text (Sembunyi di Desktop) */}
              <span
                className={`
                  text-[10px] 
                  md:hidden 
                  font-semibold 
                  transition-colors 
                  ${pathname === "/pesanan" ? "text-primary" : "text-sky-600"}
                `}
              >
                Pesanan
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
                    pathname === "/admin"
                      ? "text-white border-white"
                      : "text-sky-100 border-transparent hover:text-white hover:border-white/30"
                  }
                `}
              >
                Pesanan
              </span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Kolom 3 Kosong - Menyeimbangkan agar menu di Kolom 2 tepat berada di tengah layar */}
      <div className="hidden md:block"></div>
    </nav>
  );
}
