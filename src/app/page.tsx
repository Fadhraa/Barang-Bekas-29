import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
export default function Home() {
  return (
    <div className="w-full min-h-screen relative">
      <Navbar />
      <div className="bg-surface mx-auto w-full h-auto flex justify-center">
        <Hero />
      </div>
    </div>
  );
}
