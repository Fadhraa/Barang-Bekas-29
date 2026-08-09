"use client";
export default function Hero() {
  return (
    <section className="w-full h-auto p-4 bg-white border border-slate-300 shadow-sm rounded-lg">
      <div className="flex justify-around">
        <div className="flex flex-col flex-2">
          <h2 className="text-primary font-bold text-lg">Selamat Datang</h2>
          <span className="text-md">
            Jadilah Tuan kedua dari barang pilihan anda
          </span>
        </div>
        <div className="flex w-full flex-1 relative">
          <img
            className="absolute z-20 rotate-6 right-8 top-5"
            src="./hero_img/sepatu.png"
            alt=""
          />
          <img
            className="absolute z-10 rotate-4 bottom-[-20px]"
            src="./hero_img/tas.png"
            alt=""
          />
          <img
            className="absolute z-20 rotate-18 left-10 bottom-[-30px]"
            src="./hero_img/tumbler.png"
            alt=""
          />
        </div>
      </div>
    </section>
  );
}
