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
    // 🅰️ PAYMENT GATEWAY PROVIDER 1: IPAYMU (SANDBOX / PRODUCTION)
    // =========================================================================
    if (provider.toLowerCase() === "ipaymu") {
      const rawVa =
        process.env.IPAYMU_VA ||
        process.env.VA_SB_IPAYMU ||
        "0000005233724941";
      const rawApiKey =
        process.env.IPAYMU_API_KEY ||
        process.env.API_KEY_SB_IPAYMU ||
        "SANDBOXE8A1D6B4-4947-4709-A268-4329A71B5536";

      const va = String(rawVa).replace(/['"]/g, "").replace(/[^0-9]/g, "").trim();
      const apiKey = String(rawApiKey).replace(/['"]/g, "").trim();

      const env = (process.env.IPAYMU_ENV || "sandbox").replace(/['"]/g, "").trim();
      const host =
        env === "sandbox"
          ? "https://sandbox.ipaymu.com"
          : "https://my.ipaymu.com";

      const origin =
        request.headers.get("origin") ||
        request.headers.get("referer") ||
        "http://localhost:3000";

      // 1. Format Payload Rincian Item (Sanitasi Karakter Khusus pada Nama Produk)
      const productArray =
        items && Array.isArray(items) && items.length > 0
          ? items.map((i: any) =>
              String(i.name || "Produk")
                .replace(/[^\w\s\-\.]/gi, "")
                .trim()
                .slice(0, 50) || "Produk"
            )
          : ["Pesanan BarangBekas29"];
          
      const qtyArray =
        items && Array.isArray(items) && items.length > 0
          ? items.map((i: any) => (i.quantity != null ? Number(i.quantity) : 1))
          : [1];
          
      const priceArray =
        items && Array.isArray(items) && items.length > 0
          ? items.map((i: any) =>
              i.price != null ? Math.round(Number(i.price)) : Math.round(Number(grossAmount))
            )
          : [Math.round(Number(grossAmount))];

      const cleanBuyerName = String(customerName || "Pembeli")
        .replace(/[^\w\s\-\.]/gi, "")
        .trim() || "Pembeli";

      // Mapping Metode Pembayaran Pilihan ke Parameter iPaymu (paymentMethod & paymentChannel)
      let ipaymuMethod: string | undefined = undefined;
      let ipaymuChannel: string | undefined = undefined;

      if (paymentMethod === "bca_va") { ipaymuMethod = "va"; ipaymuChannel = "bca"; }
      else if (paymentMethod === "mandiri_va") { ipaymuMethod = "va"; ipaymuChannel = "mandiri"; }
      else if (paymentMethod === "bni_va") { ipaymuMethod = "va"; ipaymuChannel = "bni"; }
      else if (paymentMethod === "bri_va") { ipaymuMethod = "va"; ipaymuChannel = "bri"; }
      else if (paymentMethod === "qris") { ipaymuMethod = "qris"; ipaymuChannel = "qris"; }
      else if (paymentMethod === "gopay") { ipaymuMethod = "ewallet"; ipaymuChannel = "gopay"; }
      else if (paymentMethod === "shopeepay") { ipaymuMethod = "ewallet"; ipaymuChannel = "shopeepay"; }
      else if (paymentMethod === "va_all") { ipaymuMethod = "va"; }
      else if (paymentMethod === "ewallet_all") { ipaymuMethod = "ewallet"; }

      const payload: Record<string, any> = {
        product: productArray,
        qty: qtyArray,
        price: priceArray,
        returnUrl: `${origin}/pesanan`,
        notifyUrl: `${origin}/api/ipaymu-notification`,
        cancelUrl: `${origin}/checkout`,
        referenceId: orderId,
        buyerName: cleanBuyerName,
        buyerPhone: customerPhone || "082338130007",
        buyerEmail: customerEmail || "customer@barangbekas29.com",
      };

      if (ipaymuMethod) payload.paymentMethod = ipaymuMethod;
      if (ipaymuChannel) payload.paymentChannel = ipaymuChannel;

      const bodyString = JSON.stringify(payload);

      // 2. Buat Hash SHA256 dari Body Request
      const requestBodyHash = crypto
        .createHash("sha256")
        .update(bodyString)
        .digest("hex")
        .toLowerCase();

      // 3. Buat Signature HMAC-SHA256 iPaymu (POST:{va}:{bodyHash}:{apiKey})
      const stringToSign = `POST:${va}:${requestBodyHash}:${apiKey}`;
      const signature = crypto
        .createHmac("sha256", apiKey)
        .update(stringToSign)
        .digest("hex")
        .toLowerCase();

      console.log(`iPaymu Debug -> VA: [${va}], Method: [${ipaymuMethod || "all"}], Channel: [${ipaymuChannel || "all"}]`);

      // 4. Tembak API iPaymu /api/v2/payment
      const response = await fetch(`${host}/api/v2/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          signature: signature,
          va: va,
          timestamp: Date.now().toString(),
        },
        body: bodyString,
      });

      const data = await response.json();
      console.log("iPaymu Response Data Full:", JSON.stringify(data));

      const paymentUrl =
        data.data?.Url ||
        data.Data?.Url ||
        data.data?.url ||
        data.Data?.url ||
        data.url ||
        data.Url;

      const sessionID =
        data.data?.SessionID ||
        data.Data?.SessionID ||
        data.data?.sessionID ||
        data.Data?.sessionID ||
        data.sessionID;

      const isStatusSuccess =
        data.status === 200 ||
        data.Status === 200 ||
        data.status === "200" ||
        data.Status === "200" ||
        data.message === "Success" ||
        data.Message === "Success";

      if (isStatusSuccess && paymentUrl) {
        return NextResponse.json({
          provider: "ipaymu",
          paymentUrl: paymentUrl,
          sessionID: sessionID,
        });
      } else {
        const errorDetail =
          (typeof data.data === "string" ? data.data : null) ||
          (data.message !== "Success" ? data.message : null) ||
          (data.Message !== "Success" ? data.Message : null) ||
          "Gagal membuat URL transaksi iPaymu";
        console.error("Gagal iPaymu API Detail:", data);
        throw new Error(errorDetail);
      }
    }

    // =========================================================================
    // 🅱️ PAYMENT GATEWAY PROVIDER 2: MIDTRANS SNAP (SANDBOX / PRODUCTION)
    // =========================================================================
    const serverKey =
      process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-ya6fFH8vsfyP8gET_HcYLN83";
    const authHeader = Buffer.from(`${serverKey}:`).toString("base64");

    // Mapping Metode Pembayaran Pilihan ke parameter Midtrans `enabled_payments`
    let enabledPayments: string[] | undefined = undefined;

    if (paymentMethod === "bca_va") enabledPayments = ["bca_va"];
    else if (paymentMethod === "mandiri_va") enabledPayments = ["echannel"];
    else if (paymentMethod === "bni_va") enabledPayments = ["bni_va"];
    else if (paymentMethod === "bri_va") enabledPayments = ["bri_va"];
    else if (paymentMethod === "permata_va") enabledPayments = ["permata_va"];
    else if (paymentMethod === "qris") enabledPayments = ["gopay", "other_qris", "shopeepay"];
    else if (paymentMethod === "gopay") enabledPayments = ["gopay"];
    else if (paymentMethod === "shopeepay") enabledPayments = ["shopeepay"];
    else if (paymentMethod === "va_all") enabledPayments = ["bca_va", "echannel", "bni_va", "bri_va", "permata_va"];
    else if (paymentMethod === "ewallet_all") enabledPayments = ["gopay", "shopeepay"];

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

    // Pasang enabled_payments jika pengguna memilih metode pembayaran spesifik
    if (enabledPayments) {
      snapPayload.enabled_payments = enabledPayments;
    }

    const snapResponse = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify(snapPayload),
      }
    );

    const snapData = await snapResponse.json();

    if (!snapResponse.ok || !snapData.token) {
      throw new Error(snapData.error_messages?.[0] || "Gagal mendapatkan token Midtrans");
    }

    return NextResponse.json({
      provider: "midtrans",
      token: snapData.token,
    });
  } catch (error: any) {
    console.error("Tokenizer API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
