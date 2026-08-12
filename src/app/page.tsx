"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Modal from "@/components/Modal";
import { useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { Product } from "@/service/productService";
import {
  Search,
  MessageCircle,
  Layers,
  Sparkles,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "@/context/cartContext";

export default function Home() {
  // Ambil 20 produk pertama untuk optimasi performa layar
  const { products, loading, error } = useProducts(20);
  const { addToCart, totalItems, cart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Gunakan debounce untuk menunda penyaringan hingga pembeli selesai mengetik (400ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const categories = [
    "Semua",
    "Elektronik",
    "Pakaian",
    "Buku",
    "Otomotif",
    "Perabotan",
    "Olahraga",
    "Lain-lain",
  ];

  // Filter Produk berdasarkan Kategori & Query Pencarian (Debounced)
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "Semua" || p.category === selectedCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(debouncedSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  useEffect(() => {
    console.log(cart);
  }, [cart]);
  const handleAddToCart = (product: Product) => {
    addToCart(product);

    alert(`"${product.name}" telah ditambahkan ke keranjang!`);
  };
  // Handler Beli / Tanya via WhatsApp
  const handleBuyWhatsApp = (product: Product) => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "628123456789";
    const text = `Halo Admin BarangBekas29, saya berminat membeli produk:\n\n*${product.name}*\nHarga: Rp ${Number(product.price).toLocaleString("id-ID")}\nKategori: ${product.category}\n\nApakah barang ini masih tersedia?`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  return (
    <div className="w-full min-h-screen relative overflow-x-hidden bg-surface pb-24">
      {/* Navbar Utama */}
      <Navbar />

      {/* Hero Banner Header */}
      <div className="p-4 mx-auto w-full max-w-6xl flex justify-center">
        <Hero />
      </div>

      {/* Container Utama Katalog Pembeli */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        {/* Baris Search & Filter Kategori */}
        <div className="space-y-3 mb-6">
          {/* Search Input Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama barang bekas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-xs"
            />
          </div>

          {/* Kategori Pills Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-xs font-bold"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Produk */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs font-medium">
            Memuat daftar barang bekas...
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 text-red-600 rounded-2xl text-xs p-4 border border-red-200">
            Terjadi kesalahan: {error.message}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">
              Produk Tidak Ditemukan
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Belum ada barang bekas di kategori ini atau kata kunci pencarian
              Anda tidak cocok.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => setDetailProduct(product)}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                {/* Foto Produk */}
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Tidak ada foto
                    </div>
                  )}

                  {/* Badge Status */}
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold rounded-md shadow-xs ${
                      product.status === "Tersedia"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {product.status || "Tersedia"}
                  </span>
                </div>

                {/* Info Produk */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-primary block line-clamp-1">
                      {product.category} • {product.condition}
                    </span>
                    <h3 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 mt-0.5">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-medium">
                        Harga
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-slate-800">
                        Rp {Number(product.price || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailProduct(product);
                        }}
                        className="px-2.5 py-1 border border-primary text-primary hover:bg-primary hover:text-white rounded-full text-[11px] font-semibold transition-all"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Detail Informasi Produk & Pembelian */}
      <Modal
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        title={detailProduct?.name || "Detail Produk"}
      >
        {detailProduct && (
          <div className="space-y-4">
            {/* Foto Galeri */}
            {detailProduct.images && detailProduct.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {detailProduct.images.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                  >
                    <img
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Badges Info */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg">
                Rp {Number(detailProduct.price || 0).toLocaleString("id-ID")}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                {detailProduct.category}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-400" />
                Kondisi: {detailProduct.condition}
              </span>
            </div>

            {/* Deskripsi Lengkap */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Deskripsi Lengkap & Minus
              </h4>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {detailProduct.description || "Tidak ada deskripsi detail."}
              </p>
            </div>

            {/* Tombol Beli / WhatsApp */}
            <button
              onClick={() => handleBuyWhatsApp(detailProduct)}
              disabled={detailProduct.status === "Terjual"}
              className="w-full py-3 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              {detailProduct.status === "Terjual"
                ? "Produk Sudah Terjual"
                : "Beli / Tanya via WhatsApp"}
            </button>
            <div
              onClick={() => handleAddToCart(detailProduct)}
              className="border border-darkPrimary text-primary flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-darkPrimary hover:text-secondary transition duration-[500ms] cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Tambah ke keranjang</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
