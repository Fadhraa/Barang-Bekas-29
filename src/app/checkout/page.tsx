"use client";

import { useState, Suspense } from "react";
import { useCart } from "@/context/cartContext";
import { useToast } from "@/context/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";
import ConfirmationModal from "@/components/Confirmation_modal";
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
  Bike,
  Info,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    snap: any;
  }
}

function CheckoutContent() {
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

  // Modal Konfirmasi State
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [actionType, setActionType] = useState<"payment" | "wa">("payment");

  const triggerConfirmationModal = (type: "payment" | "wa") => {
    if (!namaLengkap || !noWhatsApp || !alamatLengkap) {
      showToast(
        "Mohon lengkapi Nama, WhatsApp, dan Alamat Pengiriman!",
        "error"
      );
      return;
    }
    setActionType(type);
    setShowConfirmationModal(true);
  };

  // Pilihan Pengiriman Kurir Lokal (Gosako / Djontor)
  const [selectedCourier] = useState({
    name: "Ojek Lokal (Gosako / Djontor)",
    price: 0, // 👈 [ONGKIR DITANGGUNG PEMBELI DI TEMPAT]
    etd: "Hari Ini",
  });

  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const test = searchParams.get("test");
  const isTestingMode = mode === "testing" || mode === "sandbox" || test === "ipaymu" || test === "midtrans";

  // Kode unik 3 digit acak per transaksi manual
  const [uniqueCode] = useState(() => Math.floor(Math.random() * 899) + 100);

  // State Pilihan Metode Pembayaran (Default: Transfer Bank Manual SeaBank)
  const [paymentMethod, setPaymentMethod] = useState("manual_transfer");

  const desktopPaymentCards = [
    {
      id: "manual_transfer",
      title: "Transfer Bank Manual",
      description: "Transfer SeaBank (Kode Unik Otomatis)",
      badge: "Rekomendasi Utama",
      icon: <Building2 className="w-4 h-4 text-emerald-600" />,
    },
    ...(isTestingMode
      ? [
          {
            id: "qris",
            title: "QRIS Instant (Sandbox)",
            description: "Scan QR via BCA, DANA, OVO, GoPay, ShopeePay",
            badge: "Mode Verifikasi",
            icon: <QrCode className="w-4 h-4 text-blue-600" />,
          },
          {
            id: "va_all",
            title: "Virtual Account (Sandbox)",
            description: "Transfer VA BCA, Mandiri, BNI, BRI, Permata",
            badge: "Mode Verifikasi",
            icon: <Building2 className="w-4 h-4 text-blue-600" />,
          },
          {
            id: "ewallet_all",
            title: "E-Wallet (Sandbox)",
            description: "Bayar langsung via GoPay & ShopeePay",
            badge: "Mode Verifikasi",
            icon: <Wallet className="w-4 h-4 text-amber-500" />,
          },
        ]
      : []),
  ];

  // Total Pembayaran (Barang + Fee Website + Kode Unik untuk Transfer Manual)
  const grandTotal = totalAmount;
  const finalTransferAmount = paymentMethod === "manual_transfer" ? grandTotal + uniqueCode : grandTotal;

  // Helper Simpan ID Pesanan ke LocalStorage HP Pembeli untuk Privasi
  const saveOrderToLocalStorage = (orderId: string) => {
    try {
      const existing = JSON.parse(
        localStorage.getItem("barang_bekas_my_orders") || "[]"
      );
      if (!existing.includes(orderId)) {
        localStorage.setItem(
          "barang_bekas_my_orders",
          JSON.stringify([orderId, ...existing])
        );
      }
    } catch (e) {
      console.error("Gagal menyimpan orderId ke localStorage", e);
    }
  };

  // Helper Persiapan Payload Pesanan
  const prepareOrderPayload = () => {
    const orderId = `ORD-${Date.now()}`;
    const itemsPayload = [
      ...cart.map((item) => ({
        id: item.product.id.slice(0, 50),
        price: Math.round(Number(item.product.price)),
        quantity: item.quantity,
        name: item.product.name.slice(0, 50),
      })),
      /* [SISTEM ONGKIR DINONAKTIFKAN: Item shipping_fee tidak dimasukkan ke payload payment gateway]
      {
        id: "shipping_fee",
        price: Math.round(selectedCourier.price),
        quantity: 1,
        name: `Ongkir (${selectedCourier.name})`.slice(0, 50),
      },
      */
      {
        id: "fee_website",
        price: Math.round(feeWebsite),
        quantity: 1,
        name: "Biaya Layanan Website",
      },
    ];

    const calculatedGrossAmount = itemsPayload.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return { orderId, itemsPayload, calculatedGrossAmount };
  };

  // =========================================================================
  // 🅰️ FUNGSI KHUSUS PEMBAYARAN IPAYMU (DIRECT PAYMENT PAGE REDIRECT)
  // =========================================================================
  const handleIpaymuPayment = async () => {
    setIsProcessing(true);
    try {
      const { orderId, itemsPayload, calculatedGrossAmount } = prepareOrderPayload();

      // 1. Simpan Dokumen Pesanan ke Firestore
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
        feeWebsite: Math.round(feeWebsite),
        // shippingFee: selectedCourier.price, // 👈 [SISTEM ONGKIR DINONAKTIFKAN]
        grossAmount: calculatedGrossAmount,
        status: "Menunggu Pembayaran",
        packingStatus: "Belum Dikemas",
        expiredAt: Date.now() + 15 * 60 * 1000,
      });

      // 2. Simpan ke LocalStorage HP Pembeli
      saveOrderToLocalStorage(orderId);

      // 3. Minta URL Pembayaran iPaymu dari API Route Tokenizer
      const res = await fetch("/api/tokenizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          grossAmount: calculatedGrossAmount,
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

      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.error || "Gagal mendapatkan URL transaksi iPaymu");
      }

      setIsProcessing(false);
      clearCart();
      showToast("Mengarahkan ke halaman pembayaran iPaymu...", "info");

      // Redirect ke Halaman Pembayaran iPaymu Resmi
      window.location.href = data.paymentUrl;
    } catch (err: any) {
      console.error("iPaymu Payment Error:", err);
      showToast(err.message || "Gagal memproses pembayaran iPaymu", "error");
      setIsProcessing(false);
    }
  };

  // =========================================================================
  // 🅱️ FUNGSI KHUSUS PEMBAYARAN MIDTRANS (SNAP POPUP MODAL)
  // =========================================================================
  const handleMidtransPayment = async () => {
    setIsProcessing(true);
    try {
      const { orderId, itemsPayload, calculatedGrossAmount } = prepareOrderPayload();

      // 1. Simpan Dokumen Pesanan ke Firestore
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
        feeWebsite: Math.round(feeWebsite),
        // shippingFee: selectedCourier.price, // 👈 [SISTEM ONGKIR DINONAKTIFKAN]
        grossAmount: calculatedGrossAmount,
        status: "Menunggu Pembayaran",
        packingStatus: "Belum Dikemas",
        expiredAt: Date.now() + 15 * 60 * 1000,
      });

      // 2. Simpan ke LocalStorage HP Pembeli
      saveOrderToLocalStorage(orderId);

      // 3. Minta Token Snap dari API Route Tokenizer
      const res = await fetch("/api/tokenizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          grossAmount: calculatedGrossAmount,
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
        throw new Error(data.error || "Gagal mendapatkan token transaksi Midtrans");
      }

      setIsProcessing(false);

      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: async function (result: any) {
            await updateOrderStatus(orderId, "Sudah Dibayar", {
              paymentResult: result,
            });
            clearCart();
            showToast("Pembayaran Berhasil! Pesanan Anda sedang diproses.", "success");
            router.push("/pesanan");
          },
          onPending: async function (result: any) {
            await updateOrderStatus(orderId, "Menunggu Pembayaran", {
              paymentResult: result,
            });
            clearCart();
            showToast("Pesanan dibuat! Silakan selesaikan pembayaran Anda.", "info");
            router.push("/pesanan");
          },
          onError: function () {
            showToast("Pembayaran gagal atau dibatalkan.", "error");
          },
          onClose: function () {
            showToast("Anda menutup popup pembayaran.", "info");
          },
        });
      }
    } catch (err: any) {
      console.error("Midtrans Payment Error:", err);
      showToast(err.message || "Gagal memproses pembayaran Midtrans", "error");
      setIsProcessing(false);
    }
  };

  // Handler Pembayaran Transfer Bank Manual (SeaBank)
  const handleManualTransferPayment = async () => {
    setIsProcessing(true);
    try {
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
        feeWebsite: Math.round(feeWebsite),
        grossAmount: finalTransferAmount,
        paymentMethod: "manual_transfer",
        uniqueCode: uniqueCode,
        bankDetails: {
          bankName: "SeaBank",
          accountNumber: "901308488803",
          accountHolder: "R Nurul Hidayati Hasyiani",
        },
        status: "Menunggu Pembayaran",
        packingStatus: "Belum Dikemas",
        expiredAt: Date.now() + 15 * 60 * 1000,
      });

      saveOrderToLocalStorage(orderId);
      clearCart();
      showToast("Pesanan berhasil dibuat! Silakan lakukan transfer.", "success");
      setIsProcessing(false);
      router.push("/pesanan");
    } catch (err: any) {
      console.error("Gagal membuat pesanan manual:", err);
      showToast(err.message || "Gagal membuat pesanan", "error");
      setIsProcessing(false);
    }
  };

  // =========================================================================
  // 🔄 MASTER PAYMENT SWITCHER HANDLER
  // =========================================================================
  const handlePaymentSubmit = async () => {
    if (paymentMethod === "manual_transfer") {
      await handleManualTransferPayment();
      return;
    }
    const provider = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_PROVIDER || "ipaymu";
    if (provider.toLowerCase() === "ipaymu") {
      await handleIpaymuPayment();
    } else {
      await handleMidtransPayment();
    }
  };

  // Handler Beli / Tanya via WhatsApp
  const handleWhatsAppCheckout = async () => {
    if (!namaLengkap || !noWhatsApp || !alamatLengkap) {
      showToast("Mohon lengkapi Nama, WhatsApp, dan Alamat Pengiriman!", "error");
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
      feeWebsite: Math.round(feeWebsite),
      // shippingFee: selectedCourier.price, // 👈 [SISTEM ONGKIR DINONAKTIFKAN]
      grossAmount: grandTotal,
      status: "Menunggu Pembayaran",
      packingStatus: "Belum Dikemas",
    });

    saveOrderToLocalStorage(orderId);

    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6282338130007";
    const itemsList = cart
      .map(
        (item) =>
          `• ${item.product.name} (${item.quantity}x) = Rp ${(
            Number(item.product.price) * item.quantity
          ).toLocaleString("id-ID")}`
      )
      .join("\n");

    const message = `Halo Admin BarangBekas29, saya ingin memesan barang [ID: ${orderId}]:\n\n*DATA PEMBELI:*\nNama: ${namaLengkap}\nWA: ${noWhatsApp}\nAlamat: ${alamatLengkap}, ${kecamatan}, ${kota}, ${provinsi}\n\n*RINCIAN PESANAN:*\n${itemsList}\n\n*RINCIAN BIAYA:*\nSubtotal: Rp ${totalPrice.toLocaleString(
      "id-ID"
    )}\nBiaya Layanan: Rp ${feeWebsite.toLocaleString(
      "id-ID"
    )}\n*TOTAL BAYAR: Rp ${grandTotal.toLocaleString(
      "id-ID"
    )}*\n\nMohon petunjuk pembayarannya. Terima kasih!`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
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
                Terintegrasi Payment Gateway & Express Delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">iPaymu & Midtrans Verified</span>
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
                        placeholder="Contoh: 082338130007"
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
                      Saat ini <strong>BarangBekas29</strong> hanya melayani pesanan dan pengiriman khusus untuk wilayah <strong>Kabupaten Sampang, Jawa Timur</strong>.
                    </p>
                    <p className="text-[10px] text-amber-700 font-semibold pt-0.5">
                      🔔 Untuk pengiriman ke kota/kabupaten lain, mohon nantikan update perkembangan terbaru dari website kami!
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
                      <option value="Kabupaten Sampang">Kabupaten Sampang</option>
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

              {/* 3. Opsi Pengiriman Kurir Lokal (Gosako / Djontor) */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-xs sm:text-sm text-slate-800 font-rubik">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Metode Pengiriman Paket</span>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm font-rubik">
                    <Bike className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pengiriman via Ojek Lokal (Gosako / Djontor)</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pengiriman pesanan Anda khusus wilayah Kabupaten Sampang akan dikirimkan langsung menggunakan mitra ekspedisi/ojek lokal (<strong>Gosako</strong> / <strong>Djontor</strong>).
                  </p>

                  <div className="pt-2 border-t border-emerald-200/60 flex items-start gap-1.5 text-[11px] font-bold text-amber-800">
                    <Info className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                    <span>Catatan: Biaya ongkos kirim (ongkir) ditanggung penuh oleh pembeli saat paket diterima di tempat (COD Ongkir).</span>
                  </div>
                </div>
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
                    <option value="manual_transfer">
                      Transfer Bank Manual (SeaBank)
                    </option>
                    {isTestingMode && (
                      <>
                        <option value="qris">
                          QRIS Instant (Sandbox iPaymu)
                        </option>
                        <option value="bca_va">Virtual Account BCA (Sandbox)</option>
                        <option value="mandiri_va">Virtual Account Mandiri (Sandbox)</option>
                        <option value="bni_va">Virtual Account BNI (Sandbox)</option>
                        <option value="bri_va">Virtual Account BRI (Sandbox)</option>
                        <option value="gopay">E-Wallet GoPay (Sandbox)</option>
                        <option value="shopeepay">E-Wallet ShopeePay (Sandbox)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* B. CARD SELECT BOX UNTUK DESKTOP (DESKTOP ONLY: hidden sm:grid) */}
                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                {/* BOX REKENING SEABANK JIKA METODE MANUAL DIPILIH */}
                {paymentMethod === "manual_transfer" && (
                  <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                        <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Informasi Rekening Transfer Bank Manual</span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        Resmi & Aktif
                      </span>
                    </div>

                    <div className="bg-white border border-blue-200/60 rounded-xl p-3.5 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-500 text-[11px]">Bank Tujuan:</span>
                        <span className="font-bold text-slate-800 font-rubik">SeaBank</span>
                      </div>

                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-500 text-[11px]">Nomor Rekening:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-700 font-mono text-sm tracking-wider">
                            901308488803
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText("901308488803");
                              showToast("Nomor rekening SeaBank berhasil disalin!", "success");
                            }}
                            className="p-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[11px]">Atas Nama (A.N.):</span>
                        <span className="font-bold text-slate-800 text-[11px]">
                          R Nurul Hidayati Hasyiani
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-amber-800 font-bold">
                        <span>Total yang Harus Ditransfer:</span>
                        <span className="text-sm font-rubik text-amber-900 font-bold">
                          Rp {finalTransferAmount.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-700 leading-relaxed">
                        ⚠️ PENTING: Mohon transfer pas senilai <strong>Rp {finalTransferAmount.toLocaleString("id-ID")}</strong> (termasuk 3 digit kode unik <strong>#{uniqueCode}</strong>) agar pesanan Anda otomatis terverifikasi dengan cepat oleh Admin.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* KOLOM KANAN: Ringkasan Pembayaran (1 Kolom) */}
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

                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Layanan Website</span>
                    <span className="font-semibold text-slate-800">
                      Rp {feeWebsite.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {paymentMethod === "manual_transfer" && (
                    <div className="flex justify-between text-amber-700 font-semibold">
                      <span>Kode Unik Verifikasi (#{uniqueCode})</span>
                      <span>+Rp {uniqueCode}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-slate-800">
                    <span className="font-bold text-xs">Total Pembayaran</span>
                    <span className="font-bold text-base text-primary">
                      Rp {finalTransferAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Tombol Action Utama */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => triggerConfirmationModal("payment")}
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
                    onClick={() => triggerConfirmationModal("wa")}
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

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={() => {
          if (actionType === "payment") {
            handlePaymentSubmit();
          } else {
            handleWhatsAppCheckout();
          }
        }}
        title="Konfirmasi Data Pengiriman"
        message="Mohon pastikan Nama, WhatsApp, dan Alamat Anda sudah benar agar tidak salah kirim."
        dataSummary={{
          nama: namaLengkap,
          whatsapp: noWhatsApp,
          email: email,
          alamat: `${alamatLengkap}, ${kecamatan}, ${kota}, ${provinsi}`,
        }}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-rubik text-xs text-slate-500 font-bold">
          Memuat Halaman Checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
