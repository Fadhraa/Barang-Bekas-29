"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SyaratKetentuanPage() {
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
                <FileText className="w-6 h-6 text-primary" />
                Syarat & Ketentuan
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Aturan dan ketentuan penggunaan layanan platform BarangBekas29
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-xs text-slate-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 font-rubik uppercase tracking-wider text-primary">
                1. Ketentuan Umum
              </h2>
              <p>
                Dengan mengakses dan menggunakan platform <strong>BarangBekas29</strong>, Anda secara otomatis menyetujui seluruh Syarat dan Ketentuan yang berlaku di bawah ini. Platform ini berfokus pada transaksi jual beli barang bekas pilihan yang terverifikasi.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 font-rubik uppercase tracking-wider text-primary">
                2. Kondisi Produk
              </h2>
              <p>
                Setiap produk yang dijual merupakan barang bekas (pre-loved / thrift). Kondisi barang dijelaskan secara jujur dan transparan pada setiap deskripsi produk (Bagus, Sangat Bagus, atau terdapat minus tertentu). Pembeli diharapkan membaca deskripsi dengan teliti sebelum membeli.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 font-rubik uppercase tracking-wider text-primary">
                3. Pembayaran & Transaksi
              </h2>
              <p>
                Transaksi dilakukan melalui metode transfer / QRIS resmi yang tertera pada saat checkout. Pembayaran dinyatakan sah setelah terkonfirmasi oleh sistem atau admin BarangBekas29.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 font-rubik uppercase tracking-wider text-primary">
                4. Pengiriman Barang
              </h2>
              <p>
                Pengiriman barang dilakukan setelah pembayaran terkonfirmasi lunas. Resi pengiriman akan diberikan melalui WhatsApp atau email terdaftar.
              </p>
            </section>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-500 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Terakhir diperbarui: 14 Agustus 2026 • BarangBekas29 Official</span>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
