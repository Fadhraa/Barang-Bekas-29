import { NextResponse } from "next/server";

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
      kota,
      paymentMethod,
      items,
    } = body;

    const serverKey =
      process.env.MIDTRANS_SERVER_KEY ||
      "SB-Mid-server-ya6fFH8vsfyP8gET_HcYLN83";
    const authHeader = Buffer.from(`${serverKey}:`).toString("base64");

    // Pemetaan Metode Pembayaran Terpilih dari Website ke Midtrans enabled_payments
    let enabledPayments: string[] = [
      "qris",
      "gopay",
      "shopeepay",
      "bca_va",
      "bni_va",
      "bri_va",
      "mandiri_va",
      "permata_va",
      "other_va",
      "echannel",
    ];

    if (paymentMethod === "qris") {
      enabledPayments = ["qris", "gopay", "shopeepay"];
    } else if (paymentMethod === "bca_va") {
      enabledPayments = ["bca_va"];
    } else if (paymentMethod === "mandiri_va") {
      enabledPayments = ["echannel", "mandiri_va"];
    } else if (paymentMethod === "bni_va") {
      enabledPayments = ["bni_va"];
    } else if (paymentMethod === "bri_va") {
      enabledPayments = ["bri_va"];
    } else if (paymentMethod === "gopay") {
      enabledPayments = ["gopay", "qris"];
    } else if (paymentMethod === "shopeepay") {
      enabledPayments = ["shopeepay", "qris"];
    } else if (paymentMethod === "va_all") {
      enabledPayments = [
        "bca_va",
        "bni_va",
        "bri_va",
        "mandiri_va",
        "permata_va",
        "other_va",
        "echannel",
      ];
    } else if (paymentMethod === "ewallet_all") {
      enabledPayments = ["gopay", "shopeepay", "qris"];
    }

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(grossAmount),
      },
      enabled_payments: enabledPayments,
      item_details: items,
      customer_details: {
        first_name: customerName,
        email: customerEmail || "pembeli@barangbekas29.com",
        phone: customerPhone,
        shipping_address: {
          first_name: customerName,
          phone: customerPhone,
          address: address,
          city: kota,
        },
      },
    };

    const response = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Midtrans Tokenizer Error Response:", data);
      return NextResponse.json(
        {
          error: data.error_messages
            ? data.error_messages.join(", ")
            : "Gagal meminta token Midtrans",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      token: data.token,
      redirect_url: data.redirect_url,
    });
  } catch (error: any) {
    console.error("Tokenizer Route Internal Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
