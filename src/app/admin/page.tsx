"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useDashboardAdmin } from "@/hooks/useDashboardAdmin";
import {
  DollarSign,
  BoxIcon,
  NotebookTabs,
  Package,
  Calendar,
  ShieldCheck,
} from "lucide-react";
export default function AdminPage() {
  const { stats, loading, refreshStats } = useDashboardAdmin();

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-surface">
      {/* 1. Navbar tetap di atas */}
      <Navbar />

      {/* 2. Main mengambil sisa tinggi layar tanpa overflow */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col justify-start">
        {/* Header */}
        <header className="mb-6 bg-gradient-to-tr from-primary/80 to-primary/90 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden shrink-0">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <h1 className="font-rubik text-2xl sm:text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Selamat Datang kembali,{" "}
              <strong className="text-white font-bold">Bu Ida</strong>! Berikut
              ringkasan transaksi toko hari ini.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl shrink-0 relative z-10 flex items-center gap-3">
            <div className="p-2.5 bg-primary text-white rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                Tanggal Server
              </span>
              <span className="text-xs font-bold text-white font-rubik">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* 3. Grid diubah menjadi 3 kolom agar 3 kartu sejajar ke samping */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kartu 1: Total Pendapatan */}
          <div className="flex relative w-full rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 bg-white border border-slate-100">
            <div className="bg-emerald-500 w-full absolute top-0 left-0 h-1.5" />
            <div className="flex w-full flex-col p-5 gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-rubik text-gray-400 tracking-wider">
                TOTAL PENDAPATAN
              </span>
              <h3 className="text-xl font-bold font-rubik tracking-tight text-slate-800">
                Rp {stats?.totalRevenue?.toLocaleString("id-ID") ?? 0}
              </h3>
            </div>
          </div>

          {/* Kartu 2: Barang Dikemas */}
          <div className="flex relative w-full rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 bg-white border border-slate-100">
            <div className="bg-orange-500 w-full absolute top-0 left-0 h-1.5" />
            <div className="flex w-full flex-col p-5 gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              <span className="text-xs font-rubik text-gray-400 tracking-wider">
                BARANG DIKEMAS
              </span>
              <h3 className="text-xl font-bold font-rubik tracking-tight text-slate-800">
                {stats?.orderOnPacking ?? 0}
              </h3>
              <Link
                href="/admin/pesanan"
                className="text-xs text-primary underline font-medium hover:opacity-80 transition"
              >
                Detail →
              </Link>
            </div>
          </div>

          {/* Kartu 3: Total Produk */}
          <div className="flex relative w-full rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 bg-white border border-slate-100">
            <div className="bg-cyan-500 w-full absolute top-0 left-0 h-1.5" />
            <div className="flex w-full flex-col p-5 gap-2">
              <NotebookTabs className="w-5 h-5 text-cyan-500" />
              <span className="text-xs font-rubik text-gray-400 tracking-wider">
                TOTAL PRODUCT
              </span>
              <h3 className="text-xl font-bold font-rubik tracking-tight text-slate-800">
                {stats?.productAvailable ?? 0}
              </h3>
              <Link
                href="/admin/produk"
                className="text-xs text-primary underline font-medium hover:opacity-80 transition"
              >
                Detail →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
