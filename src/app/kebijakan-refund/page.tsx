"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RefreshCw, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function KebijakanRefundPage() {
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
                <RefreshCw className="w-6 h-6 text-primary" />
                Kebijakan Refund & Pengembalian
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Prosedur dan syarat pengembalian dana bagi pelanggan BarangBekas29
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-xs text-slate-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 font-rubik uppercase tracking-wider text-primary">
                1. Syarat Pengajuan Refund / Retur
              </h2>
              <p>
                Pengembalian dana (refund) atau pengembalian barang (retur) dapat diajukan apabila terdapat ketidaksesuaian fatal yang tidak tercantum pada deskripsi produk, seperti:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Barang yang diterima tidak sesuai dengan foto atau deskripsi produk yang tercantum.</li>
                <li>Barang mengalami kerusakan fisik fatal saat perjalanan oleh Ojek Lokal (Gosako / Djontor).</li>
                <li>Terdapat kekeliruan pengiriman item produk dari pihak penjual.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 font-rubik uppercase tracking-wider text-primary">
                2. Wajib Video Unboxing Tanpa Jeda
              </h2>
              <p>
                Pelanggan <strong>WAJIB melampirkan video unboxing utuh tanpa jeda / tanpa editan</strong> sejak paket pertama kali dibuka dari kurir. Tanpa adanya bukti video unboxing sah, pengajuan klaim refund atau retur tidak dapat diproses oleh Admin.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800 font-rubik uppercase tracking-wider text-primary">
                3. Prosedur Pengembalian Dana (Refund Manual)
              </h2>
              <p>
                Pengajuan refund dapat dilakukan maksimal <strong>1 x 24 jam</strong> setelah paket diterima. Setelah klaim disetujui Admin dan barang retur diterima kembali di alamat kami, dana refund (termasuk nilai nominal unik & biaya layanan jika kesalahan dari pihak penjual) akan ditransfer kembali secara manual ke rekening bank/e-wallet milik pelanggan dalam kurun waktu 1-2 hari kerja.
              </p>
            </section>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-500 text-[11px]">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Untuk pengajuan klaim refund & kirim video unboxing, hubungi WhatsApp Admin: 082338130007</span>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
