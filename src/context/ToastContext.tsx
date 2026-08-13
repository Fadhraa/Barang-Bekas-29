"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", title?: string) => {
      const id = Date.now().toString() + Math.random().toString().slice(2, 5);
      const newToast: ToastMessage = { id, message, type, title };

      setToasts((prev) => [...prev, newToast]);

      // Otomatis tutup notifikasi setelah 3.5 detik
      setTimeout(() => {
        removeToast(id);
      }, 3500);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Container Toast Notifikasi Kanan Atas Layar */}
      <div className="fixed top-5 right-0 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0 md:right-5">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white border-l-4 rounded-2xl shadow-xl p-4 flex items-start gap-3 transition-all duration-300 transform animate-in slide-in-from-top-5 fade-in ${
              toast.type === "success"
                ? "border-emerald-500 shadow-emerald-900/5"
                : toast.type === "error"
                  ? "border-red-500 shadow-red-900/5"
                  : "border-blue-500 shadow-blue-900/5"
            }`}
          >
            {/* Ikon Notifikasi */}
            <div
              className={`p-2 rounded-xl shrink-0 ${
                toast.type === "success"
                  ? "bg-emerald-50 text-emerald-600"
                  : toast.type === "error"
                    ? "bg-red-50 text-red-600"
                    : "bg-blue-50 text-blue-600"
              }`}
            >
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
              {toast.type === "info" && <Info className="w-5 h-5" />}
            </div>

            {/* Isi Pesan Notifikasi */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h4
                className={`text-xs font-bold font-rubik ${
                  toast.type === "success"
                    ? "text-emerald-950"
                    : toast.type === "error"
                      ? "text-red-950"
                      : "text-blue-950"
                }`}
              >
                {toast.title ||
                  (toast.type === "success"
                    ? "Berhasil!"
                    : toast.type === "error"
                      ? "Perhatian!"
                      : "Informasi")}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">
                {toast.message}
              </p>
            </div>

            {/* Tombol Silang (Close) */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam <ToastProvider>");
  }
  return context;
}
