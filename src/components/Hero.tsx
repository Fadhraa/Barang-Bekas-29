"use client";
export default function Hero() {
  return (
    <section className="w-full h-auto m-8 p-4 bg-white border border-slate-300 shadow-sm rounded-lg">
      <div className="flex justify-around">
        <div className="flex flex-col flex-2">
          <h2 className="text-primary font-bold">Selamat Datang</h2>
          <span className="text-xs">
            Jadilah Tuan kedua dari barang pilihan anda
          </span>
        </div>
        <div className="flex bg-red-200 w-full flex-1 relative">
          <img
            className="absolute z-1 rotate-6"
            src="./hero_img/sepatu.png"
            alt=""
          />
          <img
            className="absolute z-0 -rotate-6"
            src="./hero_img/tas.png"
            alt=""
          />
          <img
            className="absolute z-0 -rotate-6"
            src="./hero_img/tumbler.png"
            alt=""
          />
        </div>
      </div>
    </section>
  );
}
