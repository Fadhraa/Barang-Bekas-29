"use client";

import { ShieldCheck, Tag } from "lucide-react";

export default function Hero() {
  return (
    <section className="overflow-hidden w-full bg-gradient-to-r from-primary/10 via-slate-50 to-emerald-50/40 border border-slate-200/80 shadow-xs rounded-3xl p-5 sm:p-7 relative transition-all">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Kolom Kiri: Teks & Subtitle */}
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary font-bold text-[11px] tracking-wide">
            <span>Toko Online Barang Bekas Pilihan Sampang</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-rubik text-slate-800 tracking-tight leading-snug">
            Selamat Datang di{" "}
            <span className="text-primary">BarangBekas29</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
            Jadilah Tuan kedua dari barang pilihan Anda. Kualitas terverifikasi,
            jujur, dan harga bersahabat.
          </p>

          <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] font-semibold text-slate-500">
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

        {/* Kolom Kanan: Visual Banner Produk Overlay */}
        <div className="w-full sm:w-72 md:w-80 shrink-0 relative h-40 sm:h-44 flex items-center justify-center">
          {/* Background Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-emerald-200/30 to-amber-200/20 rounded-full blur-2xl opacity-60"></div>

          {/* Gambar 1: Tas (Kiri Belakang) */}
          <img
            className="absolute z-10 w-28 sm:w-36 object-contain drop-shadow-md -rotate-6 left-2 sm:left-4 top-2 hover:scale-105 transition-all duration-300"
            src="./hero_img/tas.png"
            alt="Tas Bekas Pilihan"
          />

          {/* Gambar 2: Sepatu (Kanan Atas) */}
          <img
            className="absolute z-20 w-28 sm:w-36 object-contain drop-shadow-lg rotate-6 right-2 sm:right-4 top-1 hover:scale-105 transition-all duration-300"
            src="./hero_img/sepatu.png"
            alt="Sepatu Bekas Quality"
          />

          {/* Gambar 3: Tumbler (Tengah Depan) */}
          <img
            className="absolute z-30 w-20 sm:w-24 object-contain drop-shadow-xl -rotate-12 left-1/2 -translate-x-1/2 bottom-0 hover:scale-110 transition-all duration-300"
            src="./hero_img/tumbler.png"
            alt="Tumbler Quality"
          />
        </div>
      </div>
    </section>
  );
}
