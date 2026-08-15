import { NextResponse } from "next/server";
import { getOrder, updateOrderStatus } from "@/service/orderService";
import { stockAtomic } from "@/service/productService";
import { updateStats } from "@/service/statsService";

export async function POST(request: Request) {
  try {
    let orderId = "";
    let status = "";
    let trxId = "";

    const contentType = request.headers.get("content-type") || "";

    // Tangani Body FormData (Form URL Encoded / Multipart) & JSON dari iPaymu
    if (contentType.includes("application/json")) {
      const body = await request.json();
      orderId = String(body.reference_id || body.referenceId || body.order_id || "").trim();
      status = String(body.status || body.status_code || "").trim();
      trxId = String(body.trx_id || body.transaction_id || "").trim();
    } else {
      const formData = await request.formData();
      orderId = String(formData.get("reference_id") || formData.get("referenceId") || "").trim();
      status = String(formData.get("status") || formData.get("status_code") || "").trim();
      trxId = String(formData.get("trx_id") || formData.get("transaction_id") || "").trim();
    }

    console.log(`[iPaymu Webhook] Received -> OrderId: "${orderId}", Status: "${status}", TrxID: "${trxId}"`);

    // iPaymu Status 'berhasil', '1', atau 'berhasil_dibayar' menandakan Pembayaran Sukses
    const statusLower = status.toLowerCase();
    const isSuccess =
      statusLower === "berhasil" ||
      statusLower === "1" ||
      statusLower === "berhasil_dibayar" ||
      statusLower === "settlement";

    if (orderId && isSuccess) {
      const existingOrder = await getOrder(orderId);

      if (!existingOrder) {
        console.warn(`[iPaymu Webhook] Order [${orderId}] tidak ditemukan di Firestore.`);
        return NextResponse.json({ status: "OK", message: "Order not found in DB" });
      }

      if (existingOrder.status !== "Sudah Dibayar") {
        console.log(`[iPaymu Webhook] Updating order [${orderId}] to Sudah Dibayar...`);

        // 1. Update Status Pesanan di Firestore
        await updateOrderStatus(orderId, "Sudah Dibayar", {
          paymentType: "iPaymu Payment Gateway",
          paidAt: new Date().toISOString(),
          iPaymuTrxId: trxId,
        });

        // 2. Update Total Pendapatan secara aman
        try {
          await updateStats({ totalRevenue: Number(existingOrder.grossAmount || 0) });
        } catch (statsErr: any) {
          console.error("[iPaymu Webhook] Gagal updateStats totalRevenue:", statsErr.message);
        }

        // 3. Kurangi Stok Produk secara Atomic
        if (existingOrder.items && Array.isArray(existingOrder.items)) {
          for (const item of existingOrder.items) {
            try {
              if (item.id) {
                await stockAtomic(item.id, item.quantity || 1);
                console.log(`[iPaymu Webhook] Stok produk ${item.name} berhasil dikurangi ${item.quantity}`);
              }
            } catch (stockErr: any) {
              console.error(`[iPaymu Webhook] Gagal mengurangi stok produk ${item.name}:`, stockErr.message);
            }
          }
        }
      } else {
        console.log(`[iPaymu Webhook] Order [${orderId}] sudah berstatus Sudah Dibayar.`);
      }
    } else if (orderId && (statusLower === "gagal" || statusLower === "expired" || statusLower === "canceled")) {
      await updateOrderStatus(orderId, "Batal");
    }

    return NextResponse.json({ status: "OK", message: "iPaymu Notification Processed Successfully" });
  } catch (error: any) {
    console.error("[iPaymu Webhook Fatal Error]:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
