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
                Dengan mengakses dan menggunakan platform <strong>BarangBekas29</strong>, Anda secara otomatis menyetujui seluruh Syarat dan Ketentuan yang berlaku di bawah ini. Platform ini berfokus pada transaksi jual beli barang bekas pilihan yang terverifikasi di wilayah Kabupaten Sampang dan sekitarnya.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 font-rubik uppercase tracking-wider text-primary">
                2. Kondisi Produk & Stok
              </h2>
              <p>
                Setiap produk yang dijual merupakan barang bekas (pre-loved / thrift) pilihan. Kondisi barang dijelaskan secara jujur pada deskripsi produk (Bagus, Sangat Bagus, atau terdapat minus tertentu). Karena stok tiap unit terbatas (biasanya 1 unit per produk), stok akan terpotong secara otomatis ketika pembayaran telah terkonfirmasi Lunas.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 font-rubik uppercase tracking-wider text-primary">
                3. Metode Pembayaran & Kode Unik
              </h2>
              <p>
                Pembayaran dilakukan melalui <strong>Transfer Bank Manual</strong> ke rekening resmi:
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
                <p>• Bank: <strong>SeaBank</strong></p>
                <p>• No. Rekening: <strong>901308488803</strong></p>
                <p>• Atas Nama: <strong>R Nurul Hidayati Hasyiani</strong></p>
              </div>
              <p>
                Pembeli <strong>WAJIB mentransfer tepat senilai Total Pembayaran yang mencakup 3 digit Kode Unik</strong> (misal Rp 20.847). Kode unik berfungsi memverifikasi transaksi pesanan Anda secara tepat dan akurat.
              </p>
              <p>
                Setiap transaksi dikenakan biaya layanan platform merata sebesar <strong>Rp 1.500</strong> untuk pemeliharaan sistem.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 font-rubik uppercase tracking-wider text-primary">
                4. Batas Waktu Pembayaran (15 Menit)
              </h2>
              <p>
                Pesanan memiliki batas waktu pembayaran selama <strong>15 menit</strong> sejak invoice diterbitkan. Jika tidak ada konfirmasi transfer dalam 15 menit, pesanan akan kadaluarsa otomatis agar produk dapat kembali tersedia bagi pembeli lain.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 font-rubik uppercase tracking-wider text-primary">
                5. Pengiriman & Kurir Lokal
              </h2>
              <p>
                Pengiriman barang untuk wilayah Sampang dan sekitarnya menggunakan mitra pengiriman <strong>Ojek Lokal (Gosako / Djontor)</strong>. Pengemasan dan pengiriman barang dilakukan setelah status pembayaran dikonfirmasi Lunas oleh Admin.
              </p>
            </section>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-500 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Terakhir diperbarui: 18 Agustus 2026 • BarangBekas29 Official</span>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
