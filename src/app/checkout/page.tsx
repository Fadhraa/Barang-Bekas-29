"use client";

import { useState } from "react";
import { useCart } from "@/context/cartContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Truck,
  ShieldCheck,
  QrCode,
  MessageCircle,
  FileText,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { cart, totalPrice, feeWebsite, totalAmount, clearCart } = useCart();

  // Form States untuk Data Pembeli & Alamat
  const [namaLengkap, setNamaLengkap] = useState("");
  const [noWhatsApp, setNoWhatsApp] = useState("");
  const [email, setEmail] = useState("");
  const [provinsi, setProvinsi] = useState("Jawa Timur");
  const [kota, setKota] = useState("Surabaya");
  const [kecamatan, setKecamatan] = useState("Wonokromo");
  const [alamatLengkap, setAlamatLengkap] = useState("");
  const [catatan, setCatatan] = useState("");

  // Simulasi Pilihan Kurir Ekspedisi
  const [selectedCourier, setSelectedCourier] = useState({
    name: "SiCepat REG",
    price: 13000,
    etd: "1-2 Hari",
  });

  const couriers = [
    { id: "sicepat", name: "SiCepat REG", price: 13000, etd: "1-2 Hari" },
    { id: "jnt", name: "J&T EZ", price: 15000, etd: "1-2 Hari" },
    { id: "jne", name: "JNE REG", price: 14000, etd: "1-3 Hari" },
  ];

  // Kalkulasi Total Pembayaran (Total Barang + Fee Website + Ongkir Kurir)
  const grandTotal = totalAmount + selectedCourier.price;

  // Handler Submit Pesanan (Frontend Dummy Action)
  const handlePlaceOrder = (method: "qris" | "wa") => {
    if (!namaLengkap || !noWhatsApp || !alamatLengkap) {
      showToast("Mohon lengkapi Nama, WhatsApp, dan Alamat Pengiriman!", "error");
      return;
    }

    if (method === "wa") {
      const phone = "6285233724944";
      const itemsList = cart
        .map(
          (item) =>
            `• ${item.product.name} (${item.quantity}x) = Rp ${(
              Number(item.product.price) * item.quantity
            ).toLocaleString("id-ID")}`
        )
        .join("\n");

      const message = `Halo Admin BarangBekas29, saya telah membuat pesanan baru:\n\n*DATA PEMBELI:*\nNama: ${namaLengkap}\nWA: ${noWhatsApp}\nAlamat: ${alamatLengkap}, ${kecamatan}, ${kota}, ${provinsi}\n\n*RINCIAN PESANAN:*\n${itemsList}\n\n*RINCIAN BIAYA:*\nSubtotal: Rp ${totalPrice.toLocaleString(
        "id-ID"
      )}\nOngkir (${selectedCourier.name}): Rp ${selectedCourier.price.toLocaleString(
        "id-ID"
      )}\nBiaya Layanan: Rp ${feeWebsite.toLocaleString(
        "id-ID"
      )}\n*TOTAL BAYAR: Rp ${grandTotal.toLocaleString(
        "id-ID"
      )}*\n\nMohon informasi instruksi pembayarannya. Terima kasih!`;

      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
      showToast("Mengarahkan ke WhatsApp Admin...", "info");
      return;
    }

    // Modal / Alert Dummy untuk Pembayaran QRIS
    showToast("Pesanan berhasil dibuat! Silakan scan QRIS untuk pembayaran.", "success");
  };

  return (
    <div className="w-full min-h-screen bg-surface pb-24">
      {/* Header Halaman (TANPA NAVBAR - Hanya Tombol Kembali) */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/keranjang"
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-primary hover:bg-white transition-all shadow-xs"
              title="Kembali ke Keranjang"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-800 font-rubik">
                Checkout Pesanan
              </h1>
              <p className="text-[11px] text-slate-500">
                Lengkapi Data Pengiriman & Pilih Metode Pembayaran
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">100% Transaksi Aman</span>
          </div>
        </div>
      </header>

      {/* Konten Utama (2 Kolom Layout) */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center shadow-xs my-8">
            <p className="text-slate-600 text-xs mb-4">
              Tidak ada barang di keranjang untuk di-checkout.
            </p>
            <Link
              href="/"
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all inline-block"
            >
              Kembali ke Katalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KOLOM KIRI: Form Pembeli, Alamat & Kurir (2 Kolom) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Informasi Pembeli */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-xs sm:text-sm text-slate-800 font-rubik">
                  <User className="w-4 h-4 text-primary" />
                  <span>Data Kontak Pembeli</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Contoh: Fadhra Ahmad"
                        value={namaLengkap}
                        onChange={(e) => setNamaLengkap(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="Contoh: 081234567890"
                        value={noWhatsApp}
                        onChange={(e) => setNoWhatsApp(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-xs"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email Pembeli <span className="text-slate-400 font-normal">(opsional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        placeholder="Contoh: nama@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Alamat Pengiriman */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-xs sm:text-sm text-slate-800 font-rubik">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Alamat Pengiriman Paket</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Provinsi</label>
                    <select
                      value={provinsi}
                      onChange={(e) => setProvinsi(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-xs"
                    >
                      <option value="Jawa Timur">Jawa Timur</option>
                      <option value="Jawa Barat">Jawa Barat</option>
                      <option value="Jawa Tengah">Jawa Tengah</option>
                      <option value="DKI Jakarta">DKI Jakarta</option>
                      <option value="Lainnya">Provinsi Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kota/Kabupaten</label>
                    <select
                      value={kota}
                      onChange={(e) => setKota(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-xs"
                    >
                      <option value="Surabaya">Surabaya</option>
                      <option value="Malang">Malang</option>
                      <option value="Sidoarjo">Sidoarjo</option>
                      <option value="Lainnya">Kota Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
                    <select
                      value={kecamatan}
                      onChange={(e) => setKecamatan(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-xs"
                    >
                      <option value="Wonokromo">Wonokromo</option>
                      <option value="Gubeng">Gubeng</option>
                      <option value="Tegalsari">Tegalsari</option>
                      <option value="Lainnya">Kecamatan Lainnya</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Alamat Lengkap & RT/RW <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Nama Jalan, Nomor Rumah, RT/RW, Patokan..."
                      value={alamatLengkap}
                      onChange={(e) => setAlamatLengkap(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-xs resize-none"
                    ></textarea>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Catatan Khusus <span className="text-slate-400 font-normal">(opsional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Titip di pagar / Paling lambat jam 5 sore"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Simulasi Pilihan Ekspedisi Pengiriman */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-xs sm:text-sm text-slate-800 font-rubik">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Pilih Opsi Kurir Ekspedisi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {couriers.map((courier) => (
                    <div
                      key={courier.id}
                      onClick={() => setSelectedCourier(courier)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedCourier.name === courier.name
                          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-800">
                          {courier.name}
                        </span>
                        <input
                          type="radio"
                          name="courier"
                          checked={selectedCourier.name === courier.name}
                          onChange={() => setSelectedCourier(courier)}
                          className="text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Estimasi: {courier.etd}
                      </span>
                      <span className="font-bold text-xs text-primary mt-2">
                        Rp {courier.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* KOLOM KANAN: Ringkasan Pesanan & Pembayaran (1 Kolom) */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 sticky top-20">
                <h2 className="font-bold text-slate-800 text-sm font-rubik pb-2 border-b border-slate-100">
                  Ringkasan Pembayaran
                </h2>

                {/* Rincian Produk Singkat */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs scrollbar-none">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between text-slate-700">
                      <span className="truncate max-w-[160px]">
                        {item.product.name} ({item.quantity}x)
                      </span>
                      <span className="font-semibold text-slate-800">
                        Rp {(Number(item.product.price || 0) * item.quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Kalkulasi Biaya */}
                <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Barang</span>
                    <span className="font-semibold text-slate-800">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Ongkos Kirim ({selectedCourier.name})</span>
                    <span className="font-semibold text-slate-800">
                      Rp {selectedCourier.price.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Layanan (0.5%)</span>
                    <span className="font-semibold text-slate-800">
                      Rp {feeWebsite.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-slate-800">
                    <span className="font-bold text-xs">Total Pembayaran</span>
                    <span className="font-bold text-base text-primary">
                      Rp {grandTotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Tampilan QRIS Statis Preview */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-700">
                    <QrCode className="w-4 h-4 text-primary" />
                    <span>Pembayaran QRIS All-Payment</span>
                  </div>
                  <div className="w-28 h-28 bg-white border border-slate-200 rounded-lg mx-auto flex items-center justify-center p-2 shadow-xs">
                    {/* Placeholder Gambar QRIS */}
                    <div className="w-full h-full bg-slate-100 rounded flex flex-col items-center justify-center text-[9px] text-slate-400 font-mono">
                      <span>[ QRIS CODE ]</span>
                      <span className="text-[8px] text-slate-400 mt-1">Scan via BCA/DANA</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Scan via GoPay, OVO, ShopeePay, DANA, BCA, atau M-Banking.
                  </p>
                </div>

                {/* Tombol Action Utama */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handlePlaceOrder("qris")}
                    className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Buat Pesanan & Bayar QRIS</span>
                  </button>

                  <button
                    onClick={() => handlePlaceOrder("wa")}
                    className="w-full py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Konfirmasi via WhatsApp</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
