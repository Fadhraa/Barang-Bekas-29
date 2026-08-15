import { NextResponse } from "next/server";
import crypto from "crypto";
import { getOrder, updateOrderStatus } from "@/service/orderService";
import { stockAtomic } from "@/service/productService";
import { updateStats } from "@/service/statsService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
      fraud_status,
    } = body;

    console.log("Midtrans Notification Incoming Body:", body);

    // 1. Tangani Notifikasi Pengujian (Test Notification URL) dari Dashboard Midtrans
    if (order_id && (order_id.startsWith("payment_notif_test") || order_id.includes("test"))) {
      console.log("Midtrans Dashboard Test Notification Verified Successfully.");
      return NextResponse.json({
        status: "OK",
        message: "Midtrans Test Notification Endpoint Active & Valid",
      });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-ya6fFH8vsfyP8gET_HcYLN83";

    // 2. Verifikasi Keaslian Signature Key SHA512 (Jika signature_key ada)
    if (signature_key && order_id && status_code && gross_amount) {
      const hash = crypto
        .createHash("sha512")
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest("hex");

      if (signature_key !== hash) {
        console.warn("Midtrans Webhook Warning: Invalid Signature Key!");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    console.log(`Midtrans Notification Received: ${order_id} -> ${transaction_status}`);

    // 3. Update Status Pesanan di Firestore
    if (order_id) {
      if (transaction_status === "capture" || transaction_status === "settlement") {
        if (fraud_status === "accept" || !fraud_status) {

          const existingOrder = await getOrder(order_id)
          if(existingOrder && existingOrder.status !== "Sudah Dibayar"){
            await Promise.all([
                updateOrderStatus(order_id, "Sudah Dibayar", {
                  paymentType: payment_type,
                  paidAt: new Date().toISOString(),
                }),
                updateStats({ totalRevenue: Number(gross_amount) }),
              ]);
            if(existingOrder.items && Array.isArray(existingOrder.items)){
              for (const item of existingOrder.items){
                try{
                 
                  await stockAtomic(item.id, item.quantity);
                  console.log(`Stock berhasil dikurangi untuk produk: ${item.name} sejumlah ${item.quantity}`);
                }catch(error){
                  console.error(`Gagal mengurangi stok untuk produk ${item.name}:`, error);
                }
              }
            }
          }
        }
      } else if (transaction_status === "pending") {
        await updateOrderStatus(order_id, "Menunggu Pembayaran", { paymentType: payment_type });
      } else if (transaction_status === "expire") {
        await updateOrderStatus(order_id, "Kadaluarsa");
      } else if (transaction_status === "cancel" || transaction_status === "deny") {
        await updateOrderStatus(order_id, "Batal");
      }
    }

    return NextResponse.json({ status: "OK", message: "Notification processed" });
  } catch (error: any) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
