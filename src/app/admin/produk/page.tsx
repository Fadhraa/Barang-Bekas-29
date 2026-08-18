"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ModalUploader from "@/components/ImageUploader";
import Modal from "@/components/Modal";
import { useToast } from "@/context/ToastContext";
import { getOptimizedImageUrl } from "@/lib/imageOptimizer";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Plus, Package, Trash2, Edit3, Layers } from "lucide-react";

export default function ProdukPage() {
  // State untuk Modal Form Tambah/Edit Produk
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // State terpisah untuk Modal Detail Produk (Menyimpan data produk yang diklik)
  const [detailProduct, setDetailProduct] = useState<any>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time Listener Firestore
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));
        setProducts(list);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Listen Error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: any) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "products", id));
        alert("Produk berhasil dihapus!");
      } catch (err: any) {
        alert(
          "Gagal menghapus produk: " + (err.message || "Terjadi kesalahan."),
        );
      }
    }
  };

  return (
    <div className="w-full min-h-screen relative overflow-x-hidden bg-surface pb-24">
      {/* Navbar khusus Admin */}
      <Navbar />

      {/* Header Halaman */}
      <div className="p-6 max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-rubik">
            Manajemen Produk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar barang bekas yang Anda jual. Tambah, edit, atau hapus produk
            di sini.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk Baru
        </button>
      </div>

      {/* Grid Daftar Produk */}
      <div className="p-6 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Memuat daftar produk...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-base">
              Belum Ada Produk
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Anda belum menambahkan barang bekas apapun. Klik tombol "Tambah
              Produk Baru" untuk mulai memasukkan barang.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Foto Produk */}
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={getOptimizedImageUrl(item.images[0], 400)}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Tidak ada foto
                    </div>
                  )}

                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md shadow-xs ${
                      Number(item.stock) > 0 && item.status !== "Terjual"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {Number(item.stock) > 0 && item.status !== "Terjual"
                      ? "Tersedia"
                      : "Terjual"}
                  </span>
                </div>

                {/* Informasi Ringkas Produk */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary mb-1">
                      <Layers className="w-3 h-3" />
                      {item.category} • {item.condition}
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Tombol Details */}
                    <button
                      onClick={() => setDetailProduct(item)}
                      className="mt-2 border border-primary text-primary hover:bg-primary hover:text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all"
                    >
                      Details
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        Harga
                      </span>
                      <span className="font-bold text-sm text-slate-800">
                        Rp {item.price?.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/50 transition-colors"
                        title="Edit Produk"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(item.id, item.name)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form Tambah / Edit Produk */}
      <ModalUploader
        modalMode={modalMode}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={selectedProduct}
      />

      {/* Modal Detail Informasi Produk (Reusable Modal Component) */}
      <Modal
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        title={detailProduct?.name || "Detail Produk"}
      >
        {detailProduct && (
          <div className="space-y-4">
            {/* Galeri Foto */}
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
                Rp {detailProduct.price?.toLocaleString("id-ID")}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg">
                Kategori: {detailProduct.category}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg">
                Kondisi: {detailProduct.condition}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg">
                Stok: {detailProduct.stock}
              </span>
            </div>

            {/* Deskripsi Lengkap */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Deskripsi Lengkap & Minus
              </h4>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {detailProduct.description ||
                  "Tidak ada deskripsi detail untuk produk ini."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
