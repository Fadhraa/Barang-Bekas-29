/**
 * Helper untuk mengoptimalkan URL Gambar Cloudinary & Media CDN
 * Mengubah gambar asli berukuran MB menjadi WebP/AVIF hemat kuota (30KB)
 */
export function getOptimizedImageUrl(
  url?: string,
  width: number = 400,
  quality: string = "auto"
): string {
  if (!url) return "";

  // Jika URL berasal dari Cloudinary upload
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    // Sisipkan transformasi Cloudinary: w_400,f_auto,q_auto
    const transformation = `w_${width},f_auto,q_${quality}`;
    return url.replace("/upload/", `/upload/${transformation}/`);
  }

  return url;
}
