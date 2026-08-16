import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  increment,
} from "firebase/firestore";

export interface DashboardStats {
  totalRevenue: number;
  orderOnPacking: number;
  productAvailable: number;
}

// Helper dinamis untuk mendapatkan Firestore DocumentReference saat fungsi dipanggil (Bukan Top-Level Module Scope)
const getStatsDocRef = () => doc(db, "system_stats", "dashboard");

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const docRef = getStatsDocRef();
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data() as DashboardStats;
    }

    const initialStats: DashboardStats = {
      totalRevenue: 0,
      orderOnPacking: 0,
      productAvailable: 0,
    };

    await setDoc(docRef, initialStats);
    return initialStats;
  } catch (err) {
    console.error("Failed to load dashboard stats", err);
    return {
      totalRevenue: 0,
      orderOnPacking: 0,
      productAvailable: 0,
    };
  }
}

export async function updateStats(updates: {
  totalRevenue?: number;
  orderOnPacking?: number;
  productAvailable?: number;
}) {
  try {
    const updateData: Record<string, any> = {};

    if (updates.totalRevenue !== undefined) {
      updateData.totalRevenue = increment(updates.totalRevenue);
    }

    if (updates.orderOnPacking !== undefined) {
      updateData.orderOnPacking = increment(updates.orderOnPacking);
    }

    if (updates.productAvailable !== undefined) {
      updateData.productAvailable = increment(updates.productAvailable);
    }

    if (Object.keys(updateData).length > 0) {
      const docRef = getStatsDocRef();
      await setDoc(docRef, updateData, { merge: true });
    }
  } catch (err) {
    console.error("Failed to update dashboard stats", err);
  }
}
