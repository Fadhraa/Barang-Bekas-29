import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderId,
      grossAmount,
      customerName,
      customerPhone,
      customerEmail,
      address,
      paymentMethod, // Direct Selected Payment Method from UI (e.g. "bca_va", "qris", "gopay")
      items,
    } = body;

    const provider =
      process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_PROVIDER || "ipaymu";

    console.log(
      `Processing Payment Request for Order [${orderId}] using Provider: ${provider.toUpperCase()}, Selected Method: [${paymentMethod || "all"}]`
    );

    // =========================================================================
    // 🛡️ SECURITY GUARD: VALIDASI TIMER 15 MENIT & STOK PRODUK REAL-TIME
    // =========================================================================
    if (orderId) {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const orderData = orderSnap.data();

        // 1. Cek Timer 15 Menit Pembayaran
        if (orderData.expiredAt && Date.now() > orderData.expiredAt) {
          await updateDoc(orderRef, { status: "Kadaluarsa" });
          return NextResponse.json(
            {
              error:
                "Batas waktu pembayaran pesanan ini telah habis (15 Menit). Pesanan otomatis dibatalkan.",
            },
            { status: 400 }
          );
        }
      }
    }

    // 2. Cek Stok Produk Real-Time di Firestore
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.id && item.id !== "fee_website") {
          const prodRef = doc(db, "products", item.id);
          const prodSnap = await getDoc(prodRef);

          if (prodSnap.exists()) {
            const currentStock = prodSnap.data().stock || 0;
            if (currentStock <= 0) {
              if (orderId) {
                await updateDoc(doc(db, "orders", orderId), { status: "Batal" });
              }
              return NextResponse.json(
                {
                  error: `Maaf, produk "${item.name}" baru saja habis didahului pembeli lain. Pesanan ini dibatalkan.`,
                },
                { status: 400 }
              );
            }
          }
        }
      }
    }

    // =========================================================================
    // 💳 PAYMENT GATEWAY: MIDTRANS SNAP (SANDBOX / PRODUCTION)
    // =========================================================================
    const serverKey =
      process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-ya6fFH8vsfyP8gET_HcYLN83";
    const authHeader = Buffer.from(`${serverKey}:`).toString("base64");
    const midtransEnv = process.env.MIDTRANS_ENV || "production";
    const snapUrl =
      midtransEnv === "production"
        ? "https://app.midtrans.com/snap/v1/transactions"
        : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const snapPayload: Record<string, any> = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(Number(grossAmount)),
      },
      credit_card: { secure: true },
      customer_details: {
        first_name: customerName,
        phone: customerPhone,
        email: customerEmail,
      },
      item_details: items,
    };

    const snapResponse = await fetch(snapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(snapPayload),
    });

    const snapData = await snapResponse.json();
    console.log("Midtrans Snap Response Data:", JSON.stringify(snapData));

    if (!snapResponse.ok || !snapData.token) {
      throw new Error(
        snapData.error_messages?.[0] || "Gagal mendapatkan token transaksi Midtrans"
      );
    }

    return NextResponse.json({
      provider: "midtrans",
      token: snapData.token,
      redirect_url: snapData.redirect_url,
    });
  } catch (error: any) {
    console.error("Midtrans Tokenizer API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
