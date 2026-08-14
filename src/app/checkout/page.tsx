"use client";

import { useState } from "react";
import { useCart } from "@/context/cartContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createOrder, updateOrderStatus } from "@/service/orderService";
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
  CreditCard,
  Building2,
  Wallet,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { cart, totalPrice, feeWebsite, totalAmount, clearCart } = useCart();

  // Loading state
  const [isProcessing, setIsProcessing] = useState(false);

  // Form States untuk Data Pembeli & Alamat (Khusus Kabupaten Sampang)
  const [namaLengkap, setNamaLengkap] = useState("");
  const [noWhatsApp, setNoWhatsApp] = useState("");
  const [email, setEmail] = useState("");
  const [provinsi, setProvinsi] = useState("Jawa Timur");
  const [kota, setKota] = useState("Kabupaten Sampang");
  const [kecamatan, setKecamatan] = useState("Sampang (Kota)");
  const [alamatLengkap, setAlamatLengkap] = useState("");
  const [catatan, setCatatan] = useState("");

  // Pilihan Kurir Ekspedisi
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

  // State Pilihan Metode Pembayaran dari Website
  const [paymentMethod, setPaymentMethod] = useState("qris");

  const desktopPaymentCards = [
    {
      id: "qris",
      title: "QRIS Instant",
      description: "Scan QR via BCA, DANA, OVO, GoPay, ShopeePay",
      badge: "Semua App / Bank",
      icon: <QrCode className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: "va_all",
      title: "Virtual Account",
      description: "Transfer VA BCA, Mandiri, BNI, BRI, Permata",
      badge: "Otomatis Cek",
      icon: <Building2 className="w-4 h-4 text-blue-600" />,
    },
    {
      id: "ewallet_all",
      title: "E-Wallet",
      description: "Bayar langsung via GoPay & ShopeePay",
      badge: "Direct App",
      icon: <Wallet className="w-4 h-4 text-amber-500" />,
    },
  ];

  // Total Pembayaran (Barang + Fee Website + Ongkir Kurir) + selectedCourier.price
  const grandTotal = totalAmount;

  // Helper Simpan ID Pesanan ke LocalStorage HP Pembeli
  const saveOrderToLocalStorage = (orderId: string) => {
    try {
      const existing = JSON.parse(
        localStorage.getItem("barang_bekas_my_orders") || "[]",
      );
      if (!existing.includes(orderId)) {
        localStorage.setItem(
          "barang_bekas_my_orders",
          JSON.stringify([orderId, ...existing]),
        );
      }
    } catch (e) {
      console.error("Gagal menyimpan orderId ke localStorage", e);
    }
  };

  // Handler Submit Pembayaran via Midtrans Snap
  const handleMidtransPayment = async () => {
    if (!namaLengkap || !noWhatsApp || !alamatLengkap) {
      showToast(
        "Mohon lengkapi Nama, WhatsApp, dan Alamat Pengiriman!",
        "error",
      );
      return;
    }

    setIsProcessing(true);

    try {
      const orderId = `ORD-${Date.now()}`;

      // 1. Format Item Rincian
      const itemsPayload = [
        ...cart.map((item) => ({
          id: item.product.id.slice(0, 50),
          price: Math.round(Number(item.product.price)),
          quantity: item.quantity,
          name: item.product.name.slice(0, 50),
        })),
        {
          id: "shipping_fee",
          price: selectedCourier.price,
          quantity: 1,
          name: `Ongkir (${selectedCourier.name})`.slice(0, 50),
        },
        {
          id: "fee_website",
          price: feeWebsite,
          quantity: 1,
          name: "Biaya Layanan Website (0.5%)",
        },
      ];

      // 2. Simpan Dokumen Pesanan ke Firestore
      await createOrder({
        orderId,
        customerName: namaLengkap,
        customerPhone: noWhatsApp,
        customerEmail: email,
        address: alamatLengkap,
        kecamatan,
        kota,
        provinsi,
        notes: catatan,
        items: cart.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          price: Number(i.product.price),
          quantity: i.quantity,
        })),
        courier: selectedCourier,
        subtotal: totalPrice,
        feeWebsite,
        shippingFee: selectedCourier.price,
        grossAmount: grandTotal,
        status: "Menunggu Pembayaran",
      });

      // 3. Simpan ke LocalStorage HP Pembeli untuk Privasi
      saveOrderToLocalStorage(orderId);

      // 4. Minta Token Snap dari API Route Tokenizer membawa paymentMethod
      const res = await fetch("/api/tokenizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          grossAmount: grandTotal,
          customerName: namaLengkap,
          customerPhone: noWhatsApp,
          customerEmail: email,
          address: alamatLengkap,
          kota,
          paymentMethod,
          items: itemsPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        throw new Error(
          data.error || "Gagal mendapatkan token transaksi Midtrans",
        );
      }

      setIsProcessing(false);

      // 5. Buka Midtrans Snap Popup Window
      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: async function (result: any) {
            await updateOrderStatus(orderId, "Sudah Dibayar", {
              paymentResult: result,
            });
            clearCart();
            showToast(
              "Pembayaran Berhasil! Pesanan Anda sedang diproses.",
              "success",
            );
            router.push("/pesanan");
          },
          onPending: async function (result: any) {
            await updateOrderStatus(orderId, "Menunggu Pembayaran", {
              paymentResult: result,
            });
            clearCart();
            showToast(
              "Pesanan dibuat! Silakan selesaikan pembayaran Anda.",
              "info",
            );
            router.push("/pesanan");
          },
          onError: function (result: any) {
            showToast("Pembayaran gagal atau dibatalkan.", "error");
          },
          onClose: function () {
            showToast("Anda menutup popup pembayaran.", "info");
          },
        });
      } else {
        showToast("Snap SDK belum siap. Silakan coba lagi.", "error");
      }
    } catch (err: any) {
      console.error("Payment Error:", err);
      showToast(
        err.message || "Terjadi kesalahan saat memproses pembayaran",
        "error",
      );
      setIsProcessing(false);
    }
  };

  // Handler Beli / Tanya via WhatsApp
  const handleWhatsAppCheckout = async () => {
    if (!namaLengkap || !noWhatsApp || !alamatLengkap) {
      showToast(
        "Mohon lengkapi Nama, WhatsApp, dan Alamat Pengiriman!",
        "error",
      );
      return;
    }

    const orderId = `ORD-${Date.now()}`;
    await createOrder({
      orderId,
      customerName: namaLengkap,
      customerPhone: noWhatsApp,
      customerEmail: email,
      address: alamatLengkap,
      kecamatan,
      kota,
      provinsi,
      notes: catatan,
      items: cart.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        price: Number(i.product.price),
        quantity: i.quantity,
      })),
      courier: selectedCourier,
      subtotal: totalPrice,
      feeWebsite,
      shippingFee: selectedCourier.price,
      grossAmount: grandTotal,
      status: "Menunggu Pembayaran",
    });

    saveOrderToLocalStorage(orderId);

    const phone = "6285233724944";
    const itemsList = cart
      .map(
        (item) =>
          `• ${item.product.name} (${item.quantity}x) = Rp ${(
            Number(item.product.price) * item.quantity
          ).toLocaleString("id-ID")}`,
      )
      .join("\n");

    const message = `Halo Admin BarangBekas29, saya ingin memesan barang [ID: ${orderId}]:\n\n*DATA PEMBELI:*\nNama: ${namaLengkap}\nWA: ${noWhatsApp}\nAlamat: ${alamatLengkap}, ${kecamatan}, ${kota}, ${provinsi}\n\n*RINCIAN PESANAN:*\n${itemsList}\n\n*RINCIAN BIAYA:*\nSubtotal: Rp ${totalPrice.toLocaleString(
      "id-ID",
    )}\nOngkir (${selectedCourier.name}): Rp ${selectedCourier.price.toLocaleString(
      "id-ID",
    )}\nBiaya Layanan: Rp ${feeWebsite.toLocaleString(
      "id-ID",
    )}\n*TOTAL BAYAR: Rp ${grandTotal.toLocaleString(
      "id-ID",
    )}*\n\nMohon petunjuk pembayarannya. Terima kasih!`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <div className="w-full min-h-screen bg-surface pb-24">
      {/* Script External Midtrans Snap Sandbox */}
      <Script
        src={
          process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ||
          "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={
          process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
          "SB-Mid-client-7v0L39m3qMRP8adc"
        }
        strategy="lazyOnload"
      />

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
                Checkout & Pembayaran
              </h1>
              <p className="text-[11px] text-slate-500">
                Terintegrasi Midtrans Payment Gateway & Express Delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Midtrans Sandbox Verified</span>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
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
            {/* KOLOM KIRI: Form Pembeli, Alamat, Kurir & Metode Pembayaran (2 Kolom) */}
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
                        placeholder="Contoh: 085233724944"
                        value={noWhatsApp}
                        onChange={(e) => setNoWhatsApp(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-xs"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email Pembeli{" "}
                      <span className="text-slate-400 font-normal">
                        (opsional)
                      </span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        placeholder="Contoh: idolafadhra212@gmail.com"
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

                {/* Banner Informasi Layanan Pengiriman Khusus Sampang */}
                <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-900 text-xs">
                      📍 Informasi Wilayah Layanan Pengiriman
                    </p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Saat ini <strong>BarangBekas29</strong> hanya melayani
                      pesanan dan pengiriman khusus untuk wilayah{" "}
                      <strong>Kabupaten Sampang, Jawa Timur</strong>.
                    </p>
                    <p className="text-[10px] text-amber-700 font-semibold pt-0.5">
                      🔔 Untuk pengiriman ke kota/kabupaten lain, mohon nantikan
                      update perkembangan terbaru dari website kami!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Provinsi
                    </label>
                    <select
                      value={provinsi}
                      onChange={(e) => setProvinsi(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-xs"
                    >
                      <option value="Jawa Timur">Jawa Timur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kota/Kabupaten
                    </label>
                    <select
                      value={kota}
                      onChange={(e) => setKota(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-xs"
                    >
                      <option value="Kabupaten Sampang">
                        Kabupaten Sampang
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kecamatan
                    </label>
                    <select
                      value={kecamatan}
                      onChange={(e) => setKecamatan(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-xs"
                    >
                      <option value="Sampang (Kota)">Sampang (Kota)</option>
                      <option value="Torjun">Torjun</option>
                      <option value="Camplong">Camplong</option>
                      <option value="Omben">Omben</option>
                      <option value="Kedungdung">Kedungdung</option>
                      <option value="Jantra">Jantra</option>
                      <option value="Robatal">Robatal</option>
                      <option value="Sokobanah">Sokobanah</option>
                      <option value="Ketapang">Ketapang</option>
                      <option value="Banyuates">Banyuates</option>
                      <option value="Pangarengan">Pangarengan</option>
                      <option value="Karang Penang">Karang Penang</option>
                      <option value="Tambelangan">Tambelangan</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Alamat Lengkap & RT/RW{" "}
                      <span className="text-red-500">*</span>
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
                      Catatan Khusus{" "}
                      <span className="text-slate-400 font-normal">
                        (opsional)
                      </span>
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

              {/* 3. Pilihan Ekspedisi Pengiriman */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-xs sm:text-sm text-slate-800 font-rubik">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Pilih Opsi Kurir Ekspedisi</span>
                </div>
                <div className="border border-primary bg-primary/10 p-4 rounded-xl">
                  <h3 className="font-rubik text-xs font-semibold text-primary mb-1">
                    Pengiriman Saat ini akan menggunakan kurir lokal "GOSAKO"
                  </h3>
                  <span className="text-xs font-rubik text-slate-600">
                    *Biaya Ongkir ditanggung oleh pembeli
                  </span>
                </div>
                {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                </div> */}
              </div>

              {/* 4. PILIH METODE PEMBAYARAN LANGSUNG DARI WEBSITE */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-xs sm:text-sm text-slate-800 font-rubik">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>Pilih Metode Pembayaran</span>
                </div>

                {/* A. DROPDOWN UNTUK HP (MOBILE ONLY: block sm:hidden) */}
                <div className="block sm:hidden text-xs space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Pilih Metode Pembayaran (HP)
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="qris">
                      QRIS Instant (Semua Bank & E-Wallet)
                    </option>
                    <option value="bca_va">Virtual Account BCA</option>
                    <option value="mandiri_va">Virtual Account Mandiri</option>
                    <option value="bni_va">Virtual Account BNI</option>
                    <option value="bri_va">Virtual Account BRI</option>
                    <option value="gopay">E-Wallet GoPay</option>
                    <option value="shopeepay">E-Wallet ShopeePay</option>
                  </select>
                </div>

                {/* B. CARD SELECT BOX UNTUK DESKTOP (DESKTOP ONLY: hidden sm:grid) */}
                <div className="hidden sm:grid grid-cols-3 gap-3">
                  {desktopPaymentCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setPaymentMethod(card.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        paymentMethod === card.id
                          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {card.icon}
                            <span className="font-bold text-xs text-slate-800">
                              {card.title}
                            </span>
                          </div>
                          <input
                            type="radio"
                            name="paymentMethodDesktop"
                            checked={paymentMethod === card.id}
                            onChange={() => setPaymentMethod(card.id)}
                            className="text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded self-start mt-3">
                        {card.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: Ringkasan Pembayaran Midtrans (1 Kolom) */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 sticky top-20">
                <h2 className="font-bold text-slate-800 text-sm font-rubik pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Ringkasan Pembayaran</span>
                </h2>

                {/* Rincian Produk Singkat */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs scrollbar-none">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between text-slate-700"
                    >
                      <span className="truncate max-w-[160px]">
                        {item.product.name} ({item.quantity}x)
                      </span>
                      <span className="font-semibold text-slate-800">
                        Rp{" "}
                        {(
                          Number(item.product.price || 0) * item.quantity
                        ).toLocaleString("id-ID")}
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

                  {/* <div className="flex justify-between text-slate-600">
                    <span>Ongkos Kirim ({selectedCourier.name})</span>
                    <span className="font-semibold text-slate-800">
                      Rp {selectedCourier.price.toLocaleString("id-ID")}
                    </span>
                  </div> */}

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

                {/* Tombol Action Utama */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleMidtransPayment}
                    disabled={isProcessing}
                    className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyiapkan Payment...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Buat Pesanan & Bayar</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Beli Manual via WhatsApp</span>
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
