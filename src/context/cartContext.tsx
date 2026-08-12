"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Product } from "@/service/productService";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  feeWebsite: number;
  totalPrice: number;
}
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("barang_bekas_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Gagal membaca local storage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("barang_bekas_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // fungsi tambah ke keranjang
  const addToCart = (product: Product) => {
    if (!product.id) return;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id,
      );
      const currentQty =
        existingIndex > -1 ? prevCart[existingIndex].quantity : 0;
      if (currentQty + 1 > product.stock) {
        alert(
          `Stok "${product.name}" tidak mencukupi! (Sisa stok: ${product.stock})`,
        );
        return prevCart;
      }
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };
  // fungsi hapus keranjang
  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId),
    );
  };

  // fungsi update jumlah
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  //   fungsi kosongkan keranjang
  const clearCart = () => {
    setCart([]);
  };

  // hitung jumlah item
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + (Number(item.product.price) || 0) * item.quantity,
    0,
  );
  const feeWebsite = totalPrice * 0.5;
  const totalAmount = totalPrice + feeWebsite;
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        feeWebsite,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
// 2. CUSTOM HOOK useCart
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart harus digunakan di dalam <CartProvider>");
  }
  return context;
}
