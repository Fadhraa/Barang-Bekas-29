"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 pt-8 pb-6 text-slate-600">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Grid Informasi Utama Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-slate-100 text-xs">
          
          {/* Kolom 1: Brand Info */}
          <div className="space-y-2">
            <h3 className="font-rubik font-bold text-base text-primary tracking-tight">
              BarangBekas29
            </h3>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Platform belanja barang bekas pilihan yang berkualitas, jujur, dan terpercaya.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Terverifikasi Resmi</span>
            </div>
          </div>

          {/* Kolom 2: Navigasi Informasi Layanan */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-rubik">
              Informasi Layanan
            </h4>
            <ul className="space-y-1.5 text-slate-500 text-[11px]">
              <li>
                <Link href="/syarat-ketentuan" className="hover:text-primary transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/kebijakan-refund" className="hover:text-primary transition-colors">
                  Kebijakan Refund
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  FAQ (Tanya Jawab)
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-primary transition-colors">
                  Kontak Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Alamat Usaha */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-rubik">
              Alamat Usaha
            </h4>
            <div className="space-y-1 text-slate-500 text-[11px]">
              <p className="flex items-start gap-1.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>Jl. Merdeka No. 29, Jawa Timur, Indonesia</span>
              </p>
            </div>
          </div>

          {/* Kolom 4: Hubungi Kami */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-rubik">
              Hubungi Kami
            </h4>
            <ul className="space-y-1.5 text-slate-500 text-[11px]">
              <li>
                <a
                  href="https://wa.me/6285233724944"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-emerald-600 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>085233724944</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:idolafadhra212@gmail.com"
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">idolafadhra212@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Footer Credits */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} BarangBekas29. Hak Cipta Dilindungi.</p>
          <div className="flex gap-3 text-slate-500">
            <Link href="/syarat-ketentuan" className="hover:text-primary transition-colors">
              Syarat & Ketentuan
            </Link>
            <span>•</span>
            <Link href="/kebijakan-refund" className="hover:text-primary transition-colors">
              Kebijakan Refund
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
