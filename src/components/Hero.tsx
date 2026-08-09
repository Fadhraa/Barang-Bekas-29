"use client";
export default function Hero() {
  return (
    <section className="overflow-hidden w-full h-auto p-4 bg-white border border-slate-300 shadow-sm rounded-lg">
      <div className="flex justify-around">
        <div className="flex flex-col flex-2">
          <h2 className="text-primary font-bold text-lg tracking-wide">
            Selamat Datang
          </h2>
          <span className="text-sm text-slate-600 leading-snug">
            Jadilah Tuan kedua dari barang pilihan anda
          </span>
        </div>
        <div className="flex w-full flex-1 relative min-h-[80px]">
          <img
            className="absolute z-20 rotate-6 right-5 top-5"
            src="./hero_img/sepatu.png"
            alt=""
          />
          <img
            className="absolute z-10 rotate-4 left-5 bottom-[-10px]"
            src="./hero_img/tas.png"
            alt=""
          />
          <img
            className="absolute z-20 rotate-18 left-12 bottom-[-20px]"
            src="./hero_img/tumbler.png"
            alt=""
          />
        </div>
      </div>
    </section>
  );
}
