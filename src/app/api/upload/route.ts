import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Next.js Serverless API Route: /api/upload
 * Menerima file foto dari frontend, membuat tanda tangan aman SHA-1 dengan Cloudinary API Secret,
 * dan mengunggah foto ke Cloudinary secara serverless. 100% GRATIS tanpa kartu kredit.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Tidak ada file gambar yang dikirim" },
        { status: 400 }
      );
    }

    // Ambil kredensial Cloudinary dari .env.local
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "wcdtekwl";
    const apiKey = process.env.CLOUDINARY_API_KEY || "371814432325821";
    const apiSecret =
      process.env.CLOUDINARY_API_SECRET || "Yx9IEG4jiNq8oNkXSNYDORKPK9I";

    // Konversi File browser menjadi Buffer & Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Buat Timestamp & Tanda Tangan Digital SHA-1 yang sah
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureString = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

    // Buat payload FormData untuk Cloudinary REST API
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", base64Image);
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", timestamp.toString());
    cloudinaryFormData.append("signature", signature);

    // Kirim request POST ke Cloudinary API
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Cloudinary API Error:", data.error);
      return NextResponse.json(
        { error: data.error.message || "Gagal mengunggah foto ke Cloudinary" },
        { status: 500 }
      );
    }

    // Kembalikan URL publik Cloudinary yang aman (HTTPS)
    return NextResponse.json({ url: data.secure_url });
  } catch (error: any) {
    console.error("Error Upload Route:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
