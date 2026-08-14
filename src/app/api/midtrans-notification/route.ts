import { NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrderStatus } from "@/service/orderService";

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

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-ya6fFH8vsfyP8gET_HcYLN83";

    // Verifikasi Keaslian Signature Key SHA512
    const hash = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (signature_key !== hash) {
      console.warn("Midtrans Webhook Warning: Invalid Signature Key!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`Midtrans Notification Received: ${order_id} -> ${transaction_status}`);

    // Update Status Pesanan di Firestore
    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        await updateOrderStatus(order_id, "Sudah Dibayar", {
          paymentType: payment_type,
          paidAt: new Date().toISOString(),
        });
      }
    } else if (transaction_status === "pending") {
      await updateOrderStatus(order_id, "Menunggu Pembayaran", { paymentType: payment_type });
    } else if (transaction_status === "expire") {
      await updateOrderStatus(order_id, "Kadaluarsa");
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      await updateOrderStatus(order_id, "Batal");
    }

    return NextResponse.json({ status: "OK" });
  } catch (error: any) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
