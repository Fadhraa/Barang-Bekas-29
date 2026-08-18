"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";
import {
  Order,
  subscribeToOrders,
  updateOrderStatus,
} from "@/service/orderService";
import { useToast } from "@/context/ToastContext";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Search,
  MessageCircle,
  CreditCard,
  XCircle,
  Box,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    snap: any;
  }
}

function OrderCountdown({ expiredAt }: { expiredAt?: number }) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiredAt) return;

    const updateTimer = () => {
      const diff = expiredAt - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00");
        setIsExpired(true);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(
          `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiredAt]);

  if (!expiredAt) return null;

  if (isExpired) {
    return (
      <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
        ⏱️ Batas waktu pembayaran telah habis
      </span>
    );
  }

  return (
    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg animate-pulse">
      ⏳ Sisa Waktu Pembayaran: {timeLeft}
    </span>
  );
}

export default function PesananPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [myOrderIds, setMyOrderIds] = useState<string[]>([]);

  // Filter States
  const [selectedFilter, setSelectedFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Provider aktif: "ipaymu" atau "midtrans"
  const activeProvider = (
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_PROVIDER || "ipaymu"
  ).toLowerCase();

  // Baca ID Pesanan milik perangkat ini dari LocalStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("barang_bekas_my_orders") || "[]"
      );
      setMyOrderIds(stored);
    } catch (e) {
      console.error("Gagal membaca my_orders dari localStorage", e);
    }
  }, []);

  // Real-time listener pesanan dari Firestore
  useEffect(() => {
    const unsubscribe = subscribeToOrders(
      (data) => {
        setOrders(data);
        setLoading(false);
      },
      (err) => {
        console.error("Gagal mengambil daftar pesanan:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filterTabs = [
    "Semua",
    "Menunggu Pembayaran",
    "Sudah Dibayar",
    "Sedang Dikemas",
    "Dalam Pengiriman",
    "Selesai",
  ];

  // 🔒 LOGIKA PRIVASI PESANAN PEMBELI GUEST:
  const filteredOrders = orders.filter((o) => {
    const cleanSearch = searchQuery.trim().toLowerCase();

    if (cleanSearch !== "") {
      const matchesSearch =
        o.orderId.toLowerCase().includes(cleanSearch) ||
        o.customerPhone.replace(/[^0-9]/g, "").includes(cleanSearch) ||
        o.customerName.toLowerCase().includes(cleanSearch);

      if (!matchesSearch) return false;
    } else {
      if (myOrderIds.length > 0) {
        if (!myOrderIds.includes(o.orderId)) return false;
      } else {
        return false;
      }
    }

    if (selectedFilter === "Semua") return true;
    if (selectedFilter === "Menunggu Pembayaran")
      return o.status === "Menunggu Pembayaran";
    if (selectedFilter === "Sudah Dibayar") return o.status === "Sudah Dibayar";
    if (selectedFilter === "Sedang Dikemas")
      return (
        o.packingStatus === "Belum Dikemas" ||
        o.packingStatus === "Sedang Dikemas" ||
        o.packingStatus === "Sudah Dikemas"
      );
    if (selectedFilter === "Dalam Pengiriman")
      return o.packingStatus === "Dalam Pengiriman";
    if (selectedFilter === "Selesai") return o.packingStatus === "Selesai";

    return true;
  });

  // Handler Lanjutkan Pembayaran Fleksibel (iPaymu Redirect / Midtrans Snap)
  const handlePayNow = async (order: Order) => {
    try {
      showToast("Menyiapkan halaman pembayaran...", "info");
      const itemsPayload = [
        ...order.items.map((i) => ({
          id: i.id.slice(0, 50),
          price: Math.round(Number(i.price)),
          quantity: i.quantity,
          name: i.name.slice(0, 50),
        })),
        ...(order.feeWebsite && order.feeWebsite > 0
          ? [
              {
                id: "fee_website",
                price: Math.round(order.feeWebsite),
                quantity: 1,
                name: "Biaya Layanan Website",
              },
            ]
          : []),
      ];

      const res = await fetch("/api/tokenizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          grossAmount: order.grossAmount,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          address: order.address,
          kota: order.kota,
          items: itemsPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || (!data.token && !data.paymentUrl)) {
        throw new Error(
          data.error || "Gagal mendapatkan URL / token transaksi pembayaran"
        );
      }

      // A. Jika Provider iPaymu: Redirect ke URL Pembayaran iPaymu
      if (data.provider === "ipaymu" && data.paymentUrl) {
        showToast("Mengarahkan ke halaman pembayaran iPaymu...", "info");
        window.location.href = data.paymentUrl;
        return;
      }

      // B. Jika Provider Midtrans: Buka Midtrans Snap Popup Window
      if (window.snap && data.token) {
        window.snap.pay(data.token, {
          onSuccess: async function (result: any) {
            await updateOrderStatus(order.orderId, "Sudah Dibayar", {
              paymentResult: result,
            });
            showToast("Pembayaran Berhasil!", "success");
          },
          onPending: function () {
            showToast("Silakan selesaikan pembayaran Anda.", "info");
          },
          onError: function () {
            showToast("Pembayaran gagal.", "error");
          },
        });
      }
    } catch (err: any) {
      console.error("Payment Handler Error:", err);
      showToast(err.message || "Gagal memproses pembayaran", "error");
    }
  };

  // Helper Badge Pembayaran
  const renderPaymentBadge = (status: Order["status"]) => {
    if (status === "Sudah Dibayar") {
      return (
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold rounded-lg flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Sudah Dibayar
        </span>
      );
    }
    if (status === "Menunggu Pembayaran") {
      return (
        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-bold rounded-lg flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-600" />
          Menunggu Pembayaran
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200/80 text-[10px] font-bold rounded-lg flex items-center gap-1">
        <XCircle className="w-3 h-3 text-red-600" />
        {status}
      </span>
    );
  };

  // Helper Badge Pengemasan / Barang
  const renderPackingBadge = (packingStatus?: Order["packingStatus"]) => {
    const status = packingStatus || "Belum Dikemas";
    if (status === "Belum Dikemas" || status === "Sedang Dikemas") {
      return (
        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-bold rounded-lg flex items-center gap-1">
          <Package className="w-3 h-3 text-amber-600 animate-pulse" />
          Sedang Dikemas
        </span>
      );
    }
    if (status === "Sudah Dikemas") {
      return (
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/80 text-[10px] font-bold rounded-lg flex items-center gap-1">
          <Box className="w-3 h-3 text-blue-600" />
          Siap Dikirim
        </span>
      );
    }
    if (status === "Dalam Pengiriman") {
      return (
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-bold rounded-lg flex items-center gap-1">
          <Truck className="w-3 h-3 text-indigo-600" />
          Dalam Pengiriman
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold rounded-lg flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Pesanan Selesai
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col justify-between">
      {/* Script Midtrans Snap */}
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

      <div>
        <Navbar />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Header Judul Halaman & Pencarian Privasi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 font-rubik flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-primary" />
                Pesanan Saya
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pantau status pembayaran & proses pengemasan barang Anda
              </p>
            </div>

            {/* Input Pencarian Pesanan Berdasarkan Nomor WA / ID Pesanan */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Lacak via No. WA / ID Pesanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Banner Informasi Privasi Pembeli */}
          <div className="mb-6 bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-blue-900">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold text-xs">Privasi Pesanan Terjamin</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Menampilkan pesanan dari perangkat ini. Untuk lacak dari HP lain, masukkan <strong>Nomor WA Anda</strong> di kolom pencarian.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedFilter === tab
                    ? "bg-primary text-white shadow-xs font-bold"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Konten Daftar Kartu Pesanan */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 animate-pulse h-48"
                >
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-12 bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center shadow-xs my-4 space-y-3">
              <Smartphone className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-sm">
                {searchQuery ? "Pesanan Tidak Ditemukan" : "Belum Ada Pesanan di Perangkat Ini"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? "Tidak ada pesanan yang cocok dengan kata kunci pencarian Anda."
                  : "Silakan masukkan Nomor WhatsApp Anda di kolom pencarian di atas untuk melacak pesanan Anda."}
              </p>
              <Link
                href="/"
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all inline-block mt-2"
              >
                Mulai Belanja Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:shadow-md transition-all"
                >
                  {/* Top Bar ID & Badge Status Dual (Pembayaran & Barang) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-xs font-rubik text-slate-800">
                        {order.orderId}
                      </span>
                      <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2">
                        •{" "}
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Baru saja"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-slate-400">Bayar:</span>
                        {renderPaymentBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-slate-400">Barang:</span>
                        {renderPackingBadge(order.packingStatus)}
                      </div>
                    </div>
                  </div>

                  {/* Rincian Produk */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-slate-50/60 p-3 rounded-xl border border-slate-100 text-xs"
                      >
                        <div>
                          <h4 className="font-bold text-slate-800">
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            Jumlah: {item.quantity}x
                          </span>
                        </div>
                        <span className="font-bold text-slate-800">
                          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Info Pengiriman & Rincian Total Biaya */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Alamat Pengiriman
                      </span>
                      <p className="font-bold text-slate-800 text-xs mt-0.5">
                        {order.customerName} ({order.customerPhone})
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                        {order.address}, {order.kecamatan}, {order.kota},{" "}
                        {order.provinsi}
                      </p>
                      <p className="text-[11px] font-semibold text-primary mt-1">
                        Kurir: {order.courier.name}
                      </p>
                      {order.resiNumber && (
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-lg">
                          <Truck className="w-3 h-3" />
                          <span>No. Resi: {order.resiNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Rekening Transfer Manual SeaBank jika memilih manual_transfer */}
                    {order.paymentMethod === "manual_transfer" && order.status === "Menunggu Pembayaran" && (
                      <div className="sm:col-span-2 p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-1.5 text-xs mt-1">
                        <div className="flex items-center justify-between font-bold text-blue-900">
                          <span>🏦 Informasi Transfer Bank Manual (SeaBank)</span>
                          {order.uniqueCode && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded-md font-bold">
                              Kode Unik: #{order.uniqueCode}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          Silakan transfer tepat senilai <strong className="text-blue-700 font-bold">Rp {order.grossAmount.toLocaleString("id-ID")}</strong> ke rekening <strong>SeaBank 901308488803 (a.n R Nurul Hidayati Hasyiani)</strong>.
                        </p>
                      </div>
                    )}

                    <div className="sm:text-right space-y-1 self-end">
                      <div className="text-[11px] text-slate-500">
                        Subtotal: Rp {order.subtotal.toLocaleString("id-ID")}{" "}
                        {order.feeWebsite !== undefined && order.feeWebsite > 0
                          ? `• Layanan: Rp ${order.feeWebsite.toLocaleString("id-ID")}`
                          : ""}
                        {order.uniqueCode !== undefined && order.uniqueCode > 0
                          ? ` • Kode Unik: Rp ${order.uniqueCode.toLocaleString("id-ID")}`
                          : ""}
                        {order.shippingFee !== undefined && order.shippingFee > 0
                          ? ` • Ongkir: Rp ${order.shippingFee.toLocaleString("id-ID")}`
                          : ""}
                      </div>
                      <div className="flex sm:justify-end items-center gap-2">
                        <span className="font-bold text-xs text-slate-700">Total Pembayaran:</span>
                        <span className="font-bold text-base text-primary font-rubik">
                          Rp {order.grossAmount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Aksi Pesanan (Bayar Sekarang Fleksibel / Hubungi WA) */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      {order.status === "Menunggu Pembayaran" && (
                        <OrderCountdown expiredAt={order.expiredAt} />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === "Menunggu Pembayaran" &&
                        order.paymentMethod === "manual_transfer" &&
                        (!order.expiredAt || Date.now() < order.expiredAt) && (
                          <a
                            href={`https://wa.me/6282338130007?text=${encodeURIComponent(
                              `Halo Admin BarangBekas29, saya sudah melakukan transfer sebesar *Rp ${order.grossAmount.toLocaleString(
                                "id-ID"
                              )}* (Kode Unik: #${order.uniqueCode || ""}) via SeaBank untuk pesanan ID: *${order.orderId}*. Mohon verifikasi & konfirmasi pembayarannya. Terima kasih!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-white" />
                            <span>Konfirmasi Transfer WA</span>
                          </a>
                        )}

                      {order.status === "Menunggu Pembayaran" &&
                        order.paymentMethod !== "manual_transfer" &&
                        (!order.expiredAt || Date.now() < order.expiredAt) && (
                          <button
                            onClick={() => handlePayNow(order)}
                            className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>
                              Bayar Sekarang (
                              {activeProvider === "ipaymu" ? "iPaymu" : "Midtrans"})
                            </span>
                          </button>
                        )}

                    <a
                      href={`https://wa.me/6282338130007?text=${encodeURIComponent(
                        `Halo Admin BarangBekas29, saya ingin bertanya mengenai pesanan ID: *${order.orderId}* (${order.customerName}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-green-50 border border-green-200 text-green-700 font-semibold text-xs rounded-xl hover:bg-green-100 transition-all flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                      <span>Tanya Admin WA</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
