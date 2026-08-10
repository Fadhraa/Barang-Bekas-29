"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader,
  ShieldCheck,
} from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { useRouter } from "next/navigation";
// OPSIONAL (Backend): Impor koneksi firebase & auth jika Anda siap mengintegrasikan backend Firebase
// import { auth } from "@/lib/firebase";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  // const router = useRouter(); // Digunakan untuk redirect ke /admin setelah login berhasil

  // State untuk menyimpan nilai input form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State untuk status UI (loading, error, sukses)
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /**
   * Handler Submit Form Login
   */
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      router.push("/admin");
    } catch (e: any) {
      if (
        e.code === "auth/invalid-credential" ||
        e.code === "auth/user-not-found"
      ) {
        setErrorMessage("Email atau password yang Anda masukkan salah.");
      }
    } finally {
      setLoading(false);
    }

    setTimeout(() => {
      setLoading(false);
      if (email === "idolaida212@gmail.com" && password === "nurul0470") {
        setSuccessMessage("Login simulasi berhasil!");
      } else {
        setErrorMessage("Simulasi: Email atau password tidak cocok.");
      }
    }, 800);
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-surface">
      {/* Kartu Container Login */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm max-w-md w-full p-6 sm:p-8 relative">
        {/* Header Kartu */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="font-bold text-2xl text-slate-800 tracking-tight">
            Login Penjual
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Masuk untuk mengelola produk & pesanan toko BarangBekas29
          </p>
        </div>

        {/* Banner Pesan Error */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium text-left leading-relaxed animate-fade-in">
            {errorMessage}
          </div>
        )}

        {/* Banner Pesan Sukses */}
        {successMessage && (
          <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-semibold text-left leading-relaxed flex items-center gap-2 animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Input Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Penjual
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              {/* Tombol Toggle Show/Hide Password */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Tombol Submit Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

        {/* Footer Navigasi */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-primary transition-colors font-medium"
          >
            ← Kembali ke Katalog Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
