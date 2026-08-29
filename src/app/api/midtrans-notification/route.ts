import { NextResponse } from "next/server";
import crypto from "crypto";
import { getOrder, updateOrderStatus } from "@/service/orderService";
import { stockAtomic } from "@/service/productService";
import { updateStats } from "@/service/statsService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Midtrans Webhook] Incoming Notification Body:", body);

    // 1. Tangani Notifikasi Pengujian (Test Notification URL) dari Dashboard Midtrans
    if (body && body.order_id && body.order_id.startsWith("test-")) {
      console.log("[Midtrans Webhook] Dashboard Test Notification Verified Successfully.");
      return NextResponse.json({
        status: "OK",
        message: "Midtrans Test Notification Endpoint Active & Valid",
      });
    }

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

    // 2. Verifikasi Keamanan Hash Signature Key Midtrans (SHA512: order_id + status_code + gross_amount + serverKey)
    if (signature_key && serverKey) {
      const payloadToHash = `${order_id}${status_code}${gross_amount}${serverKey}`;
      const calculatedSignature = crypto
        .createHash("sha512")
        .update(payloadToHash)
        .digest("hex");

      if (calculatedSignature !== signature_key) {
        console.warn("[Midtrans Webhook Warning] Invalid Signature Key! Aborting request.");
        return NextResponse.json({ error: "Invalid Signature" }, { status: 403 });
      }
    }

    console.log(
      `[Midtrans Webhook] Verified: Order [${order_id}] -> Status: [${transaction_status}], PaymentType: [${payment_type}]`
    );

    const existingOrder = await getOrder(order_id);
    if (!existingOrder) {
      console.warn(`[Midtrans Webhook] Order [${order_id}] tidak ditemukan di Firestore.`);
      return NextResponse.json({ status: "OK", message: "Order not found in DB" });
    }

    // 3. Logika Update Status Berdasarkan Evaluasi `transaction_status`
    let targetOrderStatus: "Sudah Dibayar" | "Batal" | "Menunggu Pembayaran" | null = null;

    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        targetOrderStatus = "Menunggu Pembayaran";
      } else if (fraud_status === "accept") {
        targetOrderStatus = "Sudah Dibayar";
      }
    } else if (transaction_status === "settlement") {
      targetOrderStatus = "Sudah Dibayar";
    } else if (transaction_status === "pending") {
      targetOrderStatus = "Menunggu Pembayaran";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      targetOrderStatus = "Batal";
    }

    if (targetOrderStatus && existingOrder.status !== targetOrderStatus) {
      // 4. Update Status Pesanan di Firestore
      await updateOrderStatus(order_id, targetOrderStatus, {
        paymentType: `Midtrans (${payment_type || "Snap"})`,
        paidAt: targetOrderStatus === "Sudah Dibayar" ? new Date().toISOString() : undefined,
        midtransTrxId: transaction_id || undefined,
      });

      // 5. Jika Lunas: Update Pendapatan & Kurangi Stok Produk secara Atomic
      if (targetOrderStatus === "Sudah Dibayar") {
        try {
          await updateStats({ totalRevenue: Number(existingOrder.grossAmount || 0) });
        } catch (statsErr: any) {
          console.error("[Midtrans Webhook] Gagal updateStats totalRevenue:", statsErr.message);
        }

        if (existingOrder.items && Array.isArray(existingOrder.items)) {
          for (const item of existingOrder.items) {
            try {
              if (item.id) {
                await stockAtomic(item.id, item.quantity || 1);
                console.log(
                  `[Midtrans Webhook] Stok produk ${item.name} berhasil dikurangi ${item.quantity}`
                );
              }
            } catch (stockErr: any) {
              console.error(
                `[Midtrans Webhook] Gagal mengurangi stok produk ${item.name}:`,
                stockErr.message
              );
            }
          }
        }
      }
    }

    return NextResponse.json({
      status: "OK",
      message: `Midtrans Notification Processed: ${transaction_status}`,
    });
  } catch (error: any) {
    console.error("[Midtrans Webhook Fatal Error]:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
