import { useState, useEffect, useRef } from "react";
import { useToast } from "@/context/ToastContext";
import {
  X,
  UploadCloud,
  Tag,
  Coins,
  Boxes,
  AlignLeft,
  ImagePlus,
  Trash2,
  Sparkles,
  Layers,
} from "lucide-react";

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

interface ModalUploaderProps {
  modalMode: "add" | "edit";
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function ModalUploader({
  modalMode,
  isOpen,
  onClose,
  initialData,
}: ModalUploaderProps) {
  const { showToast } = useToast();
  
  // Form States
  const [namaBarang, setNamaBarang] = useState("");
  const [hargaBarang, setHargaBarang] = useState("");
  const [stokBarang, setStokBarang] = useState("1");
  const [kategori, setKategori] = useState("Elektronik");
  const [kondisi, setKondisi] = useState("Bagus");
  const [deskripsi, setDeskripsi] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sinkronisasi data awal jika mode edit
  useEffect(() => {
    if (modalMode === "edit" && initialData) {
      setNamaBarang(initialData.name || "");
      setHargaBarang(initialData.price?.toString() || "");
      setStokBarang(initialData.stock?.toString() || "1");
      setKategori(initialData.category || "Elektronik");
      setKondisi(initialData.condition || "Bagus");
      setDeskripsi(initialData.description || "");
      setImagePreviews(initialData.images || []);
    } else {
      setNamaBarang("");
      setHargaBarang("");
      setStokBarang("1");
      setKategori("Elektronik");
      setKondisi("Bagus");
      setDeskripsi("");
      setImagePreviews([]);
      setSelectedFiles([]);
    }
  }, [modalMode, initialData, isOpen]);

  // Simulasi tambah file gambar dummy untuk demo UI
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      if (imagePreviews.length + newFiles.length > 4) {
        showToast("Maksimal 4 gambar per produk.", "error");
        return;
      }

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setSelectedFiles([...selectedFiles, ...newFiles]);
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };
  const handleRemoveImage = (index: number) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalImageUrls: string[] = [];

      // A. PROSES UPLOAD GAMBAR BARU KE CLOUDINARY VIA API ROUTE
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.url) {
          finalImageUrls.push(data.url);
        } else {
          throw new Error(data.error || "Gagal mengunggah foto ke Cloudinary");
        }
      }

      // Gabungkan gambar lama (jika mode edit) dengan gambar yang baru di-upload
      const existingUrls = imagePreviews.filter((url) =>
        url.startsWith("http"),
      );
      const allImageUrls = [...existingUrls, ...finalImageUrls];

      // B. PERSIAPKAN DATA PRODUK UNTUK FIRESTORE
      const productPayload = {
        name: namaBarang,
        price: Number(hargaBarang),
        stock: Number(stokBarang),
        category: kategori,
        condition: kondisi,
        description: deskripsi,
        images: allImageUrls,
        status: Number(stokBarang) > 0 ? "Tersedia" : "Terjual",
        updatedAt: serverTimestamp(),
      };

      // C. SIMPAN KE FIRESTORE DATABASE
      if (modalMode === "add") {
        await addDoc(collection(db, "products"), {
          ...productPayload,
          createdAt: serverTimestamp(),
        });
        showToast("Produk berhasil ditambahkan!", "success");
        setSelectedFiles([]);
        setImagePreviews([]);
      } else if (modalMode === "edit" && initialData?.id) {
        const docRef = doc(db, "products", initialData.id);
        await updateDoc(docRef, productPayload);
        showToast("Produk berhasil diperbarui!", "success");
      }

      onClose();
    } catch (error: any) {
      console.error("Error Simpan Produk:", error);
      showToast(
        "Gagal menyimpan produk: " + (error.message || "Terjadi kesalahan."),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop Gelap dengan Blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Box Kartu Modal */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="font-rubik font-bold text-lg text-slate-800">
                {modalMode === "add"
                  ? "Tambah Produk Baru"
                  : "Edit Informasi Produk"}
              </h2>
              <p className="text-[11px] text-slate-500">
                Lengkapi rincian informasi dan foto barang bekas Anda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form (Scrollable) */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-5 flex-1"
        >
          {/* Input Nama Barang */}
          <div>
            <label
              htmlFor="nama_barang"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-primary" />
              Nama Barang
            </label>
            <input
              id="nama_barang"
              type="text"
              required
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              placeholder="Misal: Sepatu Nike Air Jordan Original (Size 42)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* Grid Harga & Stok */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="harga"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                <Coins className="w-3.5 h-3.5 text-primary" />
                Harga (Rp)
              </label>
              <input
                id="harga"
                type="number"
                required
                value={hargaBarang}
                onChange={(e) => setHargaBarang(e.target.value)}
                placeholder="150000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="stok"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                <Boxes className="w-3.5 h-3.5 text-primary" />
                Stok
              </label>
              <input
                id="stok"
                type="number"
                required
                min="1"
                value={stokBarang}
                onChange={(e) => setStokBarang(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Grid Kategori & Kondisi */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="kategori"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-primary" />
                Kategori
              </label>
              <select
                id="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="Elektronik">Elektronik</option>
                <option value="Pakaian">Pakaian</option>
                <option value="Buku">Buku</option>
                <option value="Otomotif">Otomotif</option>
                <option value="Perabotan">Perabotan</option>
                <option value="Olahraga">Olahraga</option>

                <option value="Lain-lain">Lain-lain</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="kondisi"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Kondisi
              </label>
              <input
                id="kondisi"
                type="text"
                required
                value={kondisi}
                onChange={(e) => setKondisi(e.target.value)}
                placeholder="Misal: 9/10, Mulus Like New"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Input Deskripsi Barang */}
          <div>
            <label
              htmlFor="deskripsi"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              <AlignLeft className="w-3.5 h-3.5 text-primary" />
              Deskripsi & Minus
            </label>
            <textarea
              id="deskripsi"
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tuliskan kelengkapan dus, pemakaian, atau minus jika ada..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* Section Image Upload Box */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <ImagePlus className="w-3.5 h-3.5 text-primary" />
                Foto Produk ({imagePreviews.length}/4)
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Maksimal 4 Foto
              </span>
            </div>

            {/* Grid Thumbnail Gambar & Dropzone */}
            <div className="grid grid-cols-4 gap-3">
              {imagePreviews.map((src, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs"
                >
                  <img
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 text-white rounded-full hover:bg-red-600 transition-colors shadow-xs"
                    title="Hapus gambar"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary/90 text-white text-[9px] font-bold rounded-md shadow-xs">
                      Utama
                    </span>
                  )}
                </div>
              ))}

              {imagePreviews.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary group"
                >
                  <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">Pilih Foto</span>
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              {modalMode === "add" ? "Simpan Produk Baru" : "Update Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
