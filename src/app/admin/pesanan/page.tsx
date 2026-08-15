"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Order,
  subscribeToOrders,
  updateOrderStatus,
  updatePackingStatus,
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
  XCircle,
  Box,
  Send,
  Edit3,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

export default function AdminPesananPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Semua");
  const [editingOrderResi, setEditingOrderResi] = useState<string | null>(null);
  const [resiInput, setResiInput] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToOrders(
      (data) => {
        setOrders(data);
        setLoading(false);
      },
      (err) => {
        console.error("Admin Order Error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filterTabs = [
    "Semua",
    "Menunggu Pembayaran",
    "Sudah Dibayar",
    "Belum Dikemas",
    "Sedang Dikemas",
    "Dalam Pengiriman",
    "Selesai",
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === "Semua") return true;
    if (selectedFilter === "Menunggu Pembayaran") return o.status === "Menunggu Pembayaran";
    if (selectedFilter === "Sudah Dibayar") return o.status === "Sudah Dibayar";
    if (selectedFilter === "Belum Dikemas") return o.packingStatus === "Belum Dikemas" || !o.packingStatus;
    if (selectedFilter === "Sedang Dikemas") return o.packingStatus === "Sedang Dikemas" || o.packingStatus === "Sudah Dikemas";
    if (selectedFilter === "Dalam Pengiriman") return o.packingStatus === "Dalam Pengiriman";
    if (selectedFilter === "Selesai") return o.packingStatus === "Selesai";

    return true;
  });

  // Update Status Pembayaran (Manual Overrule oleh Admin)
  const handleUpdatePayment = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Status pembayaran berhasil diubah ke: ${newStatus}`, "success");
    } catch (err: any) {
      showToast(err.message || "Gagal mengupdate status", "error");
    }
  };

  // Update Status Pengemasan & Pengiriman
  const handleUpdatePacking = async (
    orderId: string,
    newStatus: Order["packingStatus"],
    resi?: string
  ) => {
    try {
      await updatePackingStatus(orderId, newStatus, resi);
      setEditingOrderResi(null);
      setResiInput("");
      showToast(`Status pengemasan berhasil diubah ke: ${newStatus}`, "success");
    } catch (err: any) {
      showToast(err.message || "Gagal mengupdate status pengemasan", "error");
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {/* Header Judul Admin */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/produk"
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-primary transition-all shadow-xs"
                title="Kembali ke Manajemen Produk"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 font-rubik flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  Manajemen Pesanan Pembeli (Admin)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola status pembayaran, proses pengemasan barang, dan resi pengiriman
                </p>
              </div>
            </div>

            {/* Input Pencarian Pesanan */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari ID Pesanan / No. WA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-xs"
              />
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

          {/* List Pesanan Admin */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs font-medium bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              Memuat data pesanan...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center shadow-xs my-4 space-y-2">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-sm">Tidak Ada Pesanan</h3>
              <p className="text-xs text-slate-500">
                Belum ada data pesanan di kategori ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:shadow-md transition-all"
                >
                  {/* Top Bar Order ID & Tanggal */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-sm font-rubik text-slate-800">
                        {order.orderId}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        • {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Baru saja"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/^0/, "62")}?text=${encodeURIComponent(
                          `Halo Kak ${order.customerName}, kami dari Admin BarangBekas29 ingin mengonfirmasi pesanan ID: *${order.orderId}*.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-green-100 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                        <span>Chat WA Pembeli</span>
                      </a>
                    </div>
                  </div>

                  {/* Body Content (Barang & Pengiriman) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Rincian Produk */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Daftar Barang Dipesan
                      </span>
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100"
                        >
                          <span className="font-bold text-slate-800">
                            {item.name} ({item.quantity}x)
                          </span>
                          <span className="font-semibold text-slate-700">
                            Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Informasi Pembeli & Alamat */}
                    <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Penerima & Alamat Pengiriman
                      </span>
                      <p className="font-bold text-slate-800">
                        {order.customerName} ({order.customerPhone})
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        {order.address}, {order.kecamatan}, {order.kota}, {order.provinsi}
                      </p>
                      <p className="font-bold text-primary pt-1">
                        Kurir: {order.courier?.name || "Lokal"} {order.shippingFee ? `(Rp ${order.shippingFee.toLocaleString("id-ID")})` : "(Bebas Ongkir)"}
                      </p>
                    </div>
                  </div>

                  {/* Panel Pengaturan Status (Pembayaran & Pengemasan) */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    
                    {/* Status Pembayaran Control */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-700">
                        Status Pembayaran:
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdatePayment(order.orderId, e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs cursor-pointer focus:border-primary"
                      >
                        <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                        <option value="Sudah Dibayar">Sudah Dibayar (Lunas)</option>
                        <option value="Batal">Batal / Ditolak</option>
                        <option value="Kadaluarsa">Kadaluarsa</option>
                      </select>
                    </div>

                    {/* Status Pengemasan Barang Control */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-700">
                        Status Pengemasan & Pengiriman Barang:
                      </label>
                      <select
                        value={order.packingStatus || "Belum Dikemas"}
                        onChange={(e) => handleUpdatePacking(order.orderId, e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs cursor-pointer focus:border-primary"
                      >
                        <option value="Belum Dikemas">📦 Belum Dikemas</option>
                        <option value="Sedang Dikemas">⏳ Sedang Dikemas</option>
                        <option value="Sudah Dikemas">✅ Sudah Dikemas (Siap Kirim)</option>
                        <option value="Dalam Pengiriman">🚚 Dalam Pengiriman</option>
                        <option value="Selesai">🎉 Selesai</option>
                      </select>

                      {/* Input Nomor Resi Pengiriman */}
                      <div className="pt-2">
                        {editingOrderResi === order.orderId ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Masukkan No. Resi Ekspedisi..."
                              value={resiInput}
                              onChange={(e) => setResiInput(e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-primary"
                            />
                            <button
                              onClick={() => handleUpdatePacking(order.orderId, "Dalam Pengiriman", resiInput)}
                              className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Simpan Resi</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 font-medium">
                              Resi: <strong className="text-slate-800">{order.resiNumber || "Belum diinput"}</strong>
                            </span>
                            <button
                              onClick={() => {
                                setEditingOrderResi(order.orderId);
                                setResiInput(order.resiNumber || "");
                              }}
                              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Input / Edit Resi</span>
                            </button>
                          </div>
                        )}
                      </div>

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
