import { useState, useEffect } from "react";

/**
 * Custom Hook: useDebounce
 * Menunda pembaruan nilai (misal: pencarian) sampai pengguna berhenti mengetik selama {delay} ms.
 * Mencegah proses penyaringan / pemanggilan API yang terlalu sering.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timer penundaan
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Pembersihan timer jika pengguna masih mengetik huruf berikutnya
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
