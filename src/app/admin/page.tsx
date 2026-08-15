"use client";

import Navbar from "@/components/Navbar";
import { getDashboardStats, DashboardStats } from "@/service/statsService";
export default function AdminPage() {
  return (
    <div className="w-full min-h-screen relative overflow-x-hidden">
      <Navbar />
      <main className="max-w-6xl h-screen mx-auto px-4 sm:px-6 py-4 pb-12 bg-surface">
        <h1>Admin Dashboard</h1>
      </main>
    </div>
  );
}
