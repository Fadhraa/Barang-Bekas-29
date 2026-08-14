"use client";
import { use, useEffectEvent, useState } from "react";
import { useCart } from "@/context/cartContext";
import { useEffect } from "react";

export default function checkOutPage() {
  const { cart, totalPrice, feeWebsite, totalAmount, clearCart } = useCart();

  useEffect(() => {
    console.log(cart);
  }, [cart]);
  return (
    <div>
      <h1>checkout</h1>
      <div>
        {cart.map((item) => (
          <div key={item.product.id}>
            <h1>{item.product.name}</h1>
            <p>{item.product.price}</p>
            <p>{item.quantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
