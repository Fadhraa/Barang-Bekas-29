"use client";

import Navbar from "@/components/Navbar";
import { useCart } from "@/context/cartContext";

import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function KeranjangPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    totalPrice,
    feeWebsite,
    totalAmount,
    clearCart,
  } = useCart();

  return (
    <div className="w-full min-h-screen bg-surface pb-28">
      {/* Navbar Utama */}
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Header Halaman */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-primary transition-colors shadow-xs"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800 font-rubik">
                Keranjang Belanja
              </h1>
              <p className="text-xs text-slate-500">
                {cart.length} Jenis Barang Dalam Keranjang
              </p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-error hover:bg-error-50 px-3 py-1.5 rounded-xl border border-error-200 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Kosongkan
            </button>
          )}
        </div>

        {/* Tampilan Jika Keranjang Kosong */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center shadow-xs my-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-bold text-slate-800 text-base font-rubik">
              Keranjang Belanja Anda Kosong
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6 leading-relaxed">
              Anda belum menambahkan barang bekas apapun. Jelajahi katalog
              pilihan barang bekas berkualitas kami sekarang.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 shadow-md active:scale-[0.98] transition-all"
            >
              Jelajahi Produk
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Layout Keranjang Ada Isi (2 Kolom di Desktop, 1 Kolom di Mobile) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daftar Item Barang (2 Kolom Desktop) */}
            <div className="lg:col-span-2 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs hover:shadow-md transition-shadow"
                >
                  {/* Foto Produk */}
                  <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                        No Foto
                      </div>
                    )}
                  </div>

                  {/* Info Ringkas Produk */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-primary block truncate">
                      {item.product.category} • {item.product.condition}
                    </span>
                    <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate mt-0.5">
                      {item.product.name}
                    </h3>
                    <p className="font-bold text-xs sm:text-sm text-slate-800 mt-1">
                      Rp{" "}
                      {Number(item.product.price || 0).toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Pengatur Kuantitas (Jumlah) & Tombol Hapus */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Barang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 p-0.5 shadow-xs">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="p-1 hover:bg-white rounded-lg text-slate-700 transition-colors shadow-xs"
                        title="Kurangi Jumlah"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="px-2.5 text-xs font-bold text-slate-800 min-w-[24px] text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-white rounded-lg text-slate-700 transition-colors shadow-xs"
                        title="Tambah Jumlah"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ringkasan Belanja & Tombol Checkout (1 Kolom Desktop) */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 sticky top-20">
                <h2 className="font-bold text-slate-800 text-sm font-rubik pb-2 border-b border-slate-100">
                  Ringkasan Pembayaran
                </h2>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Harga Barang</span>
                    <span className="font-semibold text-slate-800">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Layanan (0.5%)</span>
                    <span className="font-semibold text-slate-800">
                      Rp {feeWebsite.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-slate-800">
                    <span className="font-bold">Total Pembayaran</span>
                    <span className="font-bold text-base text-primary">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Tombol Checkout */}
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>Lanjut ke Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span>Transaksi Aman & Terverifikasi</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
