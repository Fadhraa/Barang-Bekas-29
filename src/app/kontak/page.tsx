"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, MessageSquare, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function KontakPage() {
  const whatsappNumber = "085233724944";
  const emailAddress = "idolafadhra212@gmail.com";

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-primary transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 font-rubik flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                Hubungi Kami
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Informasi layanan pelanggan, email resmi, dan alamat usaha BarangBekas29
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Kartu WhatsApp */}
            <a
              href={`https://wa.me/6285233724944?text=${encodeURIComponent(
                "Halo Admin BarangBekas29, saya ingin bertanya seputar produk/pesanan."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                WhatsApp Resmi
              </span>
              <span className="font-bold text-sm text-slate-800 font-rubik block mt-0.5">
                {whatsappNumber}
              </span>
              <p className="text-[11px] text-green-600 font-semibold mt-2 flex items-center gap-1">
                Chat Langsung via WA &rarr;
              </p>
            </a>

            {/* Kartu Email */}
            <a
              href={`mailto:${emailAddress}`}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Email Dukungan
              </span>
              <span className="font-bold text-xs sm:text-sm text-slate-800 font-rubik block mt-0.5 truncate">
                {emailAddress}
              </span>
              <p className="text-[11px] text-blue-600 font-semibold mt-2 flex items-center gap-1">
                Kirim Email Resmi &rarr;
              </p>
            </a>

            {/* Kartu Jam Operasional */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Jam Layanan
              </span>
              <span className="font-bold text-xs text-slate-800 font-rubik block mt-0.5">
                Senin - Sabtu: 08:00 - 20:00 WIB
              </span>
              <p className="text-[11px] text-slate-500 mt-2">
                Respon Cepat Jam Kerja
              </p>
            </div>
          </div>

          {/* Kartu Alamat Usaha Lengkap */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm font-rubik">
              <MapPin className="w-5 h-5" />
              <span>Alamat Usaha Lengkap</span>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="font-bold text-slate-800 text-sm mb-1">
                Toko BarangBekas29 Official
              </p>
              <p>JL. Selong Square B 01, Sampang, Indonesia</p>
              <p className="text-slate-500 mt-1">
                Jawa Timur, Indonesia
              </p>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
