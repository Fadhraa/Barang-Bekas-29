"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  dataSummary?: {
    nama: string;
    whatsapp: string;
    email?: string;
    alamat: string;
  };
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  dataSummary,
}: ConfirmationModalProps) {
  // 1. Sembunyikan modal jika isOpen === false
  if (!isOpen) return null;

  return (
    // Overlay Latar Belakang Gelap Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Box Modal Utama */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
        
        {/* Tombol Tutup (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Tutup Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200/60">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm font-rubik">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Ringkasan Data Kontak Pembeli */}
        {dataSummary && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2 text-slate-700">
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-400">Nama Lengkap:</span>
              <span className="font-bold text-slate-800">{dataSummary.nama}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-400">No. WhatsApp:</span>
              <span className="font-bold text-emerald-600">{dataSummary.whatsapp}</span>
            </div>
            {dataSummary.email && (
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                  {dataSummary.email}
                </span>
              </div>
            )}
            <div className="pt-1">
              <span className="text-slate-400 block text-[11px]">Alamat Pengiriman:</span>
              <span className="font-medium text-slate-800 leading-tight block mt-0.5">
                {dataSummary.alamat}
              </span>
            </div>
          </div>
        )}

        {/* Tombol Aksi Batal & Konfirmasi Bayar */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all cursor-pointer"
          >
            Cek Kembali
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="py-2.5 px-4 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Ya, Sudah Benar</span>
          </button>
        </div>

      </div>
    </div>
  );
}
