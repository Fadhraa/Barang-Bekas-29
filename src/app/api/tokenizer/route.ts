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
    // 💳 PAYMENT GATEWAY: IPAYMU (SANDBOX / PRODUCTION)
    // =========================================================================
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

      const rawOrigin =
        request.headers.get("origin") ||
        request.headers.get("referer") ||
        "http://localhost:3000";

      // iPaymu Production menolak domain 'localhost'. Gunakan domain publik resmi yang terdaftar di iPaymu.
      const siteUrl = process.env.IPAYMU_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://barang-bekas-29.vercel.app";
      const isLocalhost = rawOrigin.includes("localhost") || rawOrigin.includes("127.0.0.1");
      const baseUrl = (env === "production" || isLocalhost) ? siteUrl.replace(/\/$/, "") : rawOrigin.replace(/\/$/, "");

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
        returnUrl: `${baseUrl}/pesanan`,
        notifyUrl: `${baseUrl}/api/ipaymu-notification`,
        cancelUrl: `${baseUrl}/checkout`,
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

      // Log IP Server Vercel / Outbound IP
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
        const ipData = await ipRes.json();
        console.log(`[Vercel Server Outbound IP]: ${ipData.ip}`);
      } catch (e) {}

      console.log(`iPaymu Debug -> VA: [${va}], Method: [${ipaymuMethod || "all"}], Channel: [${ipaymuChannel || "all"}]`);

      // 4. Tembak API iPaymu /api/v2/payment dengan Header Origin Resmi
      const response = await fetch(`${host}/api/v2/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": siteUrl,
          "Referer": siteUrl,
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
  } catch (error: any) {
    console.error("iPaymu Tokenizer API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
