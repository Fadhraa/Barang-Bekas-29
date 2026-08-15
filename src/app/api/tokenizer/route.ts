import { NextResponse } from "next/server";
import crypto from "crypto";

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
      items,
    } = body;

    const provider =
      process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_PROVIDER || "ipaymu";

    console.log(
      `Processing Payment Request for Order [${orderId}] using Provider: ${provider.toUpperCase()}`
    );

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

      // Hapus semua tanda kutip ganda/tunggal dan spasi agar murni string murni
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

      // 1. Format Payload Rincian Item (Sanitasi Karakter Khusus pada Nama Produk agar Signature 100% Identik)
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

      // Sanitasi Nama Pembeli
      const cleanBuyerName = String(customerName || "Pembeli")
        .replace(/[^\w\s\-\.]/gi, "")
        .trim() || "Pembeli";

      const payload = {
        product: productArray,
        qty: qtyArray,
        price: priceArray,
        returnUrl: `${origin}/pesanan`,
        notifyUrl: `${origin}/api/ipaymu-notification`,
        cancelUrl: `${origin}/checkout`,
        referenceId: orderId,
        buyerName: cleanBuyerName,
        buyerPhone: customerPhone || "085233724944",
        buyerEmail: customerEmail || "customer@barangbekas29.com",
      };

      const bodyString = JSON.stringify(payload);

      // 2. Buat Hash SHA256 dari Body Request (Hex lowercase)
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

      console.log(`iPaymu Clean Debug -> VA: [${va}], Signature: [${signature}]`);

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

      // Parsing Fleksibel untuk URL & SessionID iPaymu
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

    const snapResponse = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
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
        }),
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
