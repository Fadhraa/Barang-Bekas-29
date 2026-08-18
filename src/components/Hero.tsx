"use client";

import { ShieldCheck, Tag } from "lucide-react";

export default function Hero() {
  return (
    <section className="overflow-hidden w-full bg-gradient-to-r from-primary/10 via-slate-50 to-emerald-50/40 border border-slate-200/80 shadow-xs rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 relative transition-all">
      <div className="flex flex-row items-center justify-between gap-3 sm:gap-6">
        {/* Kolom Kiri: Teks & Subtitle */}
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-3 text-left">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-primary/10 border border-primary/20 rounded-lg md:rounded-full text-primary font-bold text-[8px] sm:text-[11px] tracking-wide">
            <span>Toko Barang Bekas Pilihan Sampang</span>
          </div>

          <h2 className="text-sm sm:text-2xl md:text-3xl font-bold font-rubik text-slate-800 tracking-tight leading-tight sm:leading-snug">
            Selamat Datang di{" "}
            <span className="text-primary">BarangBekas29</span>
          </h2>

          <p className="text-[11px] sm:text-sm text-slate-600 leading-tight sm:leading-relaxed  sm:line-clamp-none">
            Jadilah Tuan kedua dari barang pilihan Anda. jujur, dan harga
            bersahabat.
          </p>

          <div className="hidden sm:flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500 pt-1">
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              Kondisi Terjamin
            </span>
            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
              <Tag className="w-3.5 h-3.5" />
              Harga Hemat
            </span>
          </div>
        </div>

        {/* Kolom Kanan: Visual Banner Produk Overlay Compact HP */}
        <div className="w-28  xs:w-36 sm:w-72 md:w-80 shrink-0 relative h-24 sm:h-44 flex items-center justify-center">
          {/* Background Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-emerald-200/30 to-amber-200/20 rounded-full blur-xl opacity-60"></div>

          {/* Gambar 1: Tas (Kiri Belakang) */}
          <img
            className="absolute z-10 w-30 xs:w-35 sm:w-40 object-contain drop-shadow-md -rotate-6 left-[5px] sm:left-4 top-1 md:top-6 sm:top-2 hover:scale-105 transition-all duration-300"
            src="./hero_img/tas.webp"
            alt="Tas Bekas Pilihan"
            width={160}
            height={160}
            loading="eager"
            // @ts-ignore
            fetchPriority="high"
          />

          {/* Gambar 2: Sepatu (Kanan Atas) */}
          <img
            className="absolute z-20 w-25 xs:w-35 sm:w-40 object-contain drop-shadow-lg rotate-6 left-[-20px] md:left-[-40px] sm:right-4 top-[50px] md:top-[75px] sm:top-1 hover:scale-105 transition-all duration-300"
            src="./hero_img/sepatu.webp"
            alt="Sepatu Bekas Quality"
            width={160}
            height={160}
            loading="eager"
            // @ts-ignore
            fetchPriority="high"
          />

          {/* Gambar 3: Tumbler (Tengah Depan) */}
          <img
            className="absolute z-30 w-25 xs:w-30 sm:w-35 object-contain drop-shadow-xl rotate-6 left-[50px] md:left-[70px] bottom-[-10px] hover:scale-110 transition-all duration-300"
            src="./hero_img/tumbler.webp"
            alt="Tumbler Quality"
            width={140}
            height={140}
            loading="eager"
            // @ts-ignore
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}
