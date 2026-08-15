"use client";
import { AlertCircle, CheckCircle, X } from "lucide-react";
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}
