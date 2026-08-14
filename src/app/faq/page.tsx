"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HelpCircle, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Apakah barang yang dijual di BarangBekas29 100% original?",
      a: "Setiap barang bekas yang kami tampilkan telah melewati pemeriksaan kondisi dan keaslian secara teliti. Detail minus dan kondisi fisik dijelaskan secara jujur di deskripsi masing-masing produk.",
    },
    {
      q: "Bagaimana cara melakukan pembayaran?",
      a: "Kami mendukung pembayaran instan via QRIS (GoPay, OVO, DANA, ShopeePay, BCA, Mandiri, dll) serta Transfer Bank resmi.",
    },
    {
      q: "Berapa lama proses pengiriman barang?",
      a: "Pesanan yang terkonfirmasi lunas sebelum jam 15.00 WIB akan dikirim pada hari yang sama. Resi pengiriman akan diberikan via WhatsApp/Email.",
    },
    {
      q: "Apakah bisa mengajukan pengembalian jika barang tidak cocok?",
      a: "Pengembalian barang/refund dapat dilakukan jika barang tidak sesuai deskripsi atau rusak fatal dengan melampirkan Video Unboxing maksimal 1x24 jam setelah paket diterima.",
    },
    {
      q: "Bagaimana cara menghubungi Admin?",
      a: "Anda dapat menghubungi Admin langsung melalui WhatsApp di nomor 085233724944 atau email di idolafadhra212@gmail.com.",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-primary transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 font-rubik flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-primary" />
                Pertanyaan Sering Diajukan (FAQ)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Jawaban seputar pemesanan, pembayaran, dan pengiriman di BarangBekas29
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-800 font-rubik flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openIndex === idx ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {openIndex === idx && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
