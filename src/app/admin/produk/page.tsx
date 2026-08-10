"use client";

import Navbar from "@/components/Navbar";

export default function ProdukPage() {
  return (
    <div className="w-full min-h-screen relative overflow-x-hidden bg-surface">
      {/* Menampilkan Navbar dengan navigasi khusus admin */}
      <Navbar />
      
      {/* Konten Halaman Manajemen Produk */}
      <div className="p-6 max-w-6xl mx-auto pb-24 md:pb-6">
        <h1 className="text-2xl font-bold text-slate-800 font-serif">
          Manajemen Produk
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Daftar barang bekas pribadi yang Anda jual. Anda bisa menambah, mengedit, atau menghapus produk di sini.
        </p>
      </div>
    </div>
  );
}
