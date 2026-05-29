/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  tag: string;
  price: number;
  image: string;
  additionalImages?: string[];
  sizes: string[];
  description: string;
  reviews?: {
    author: string;
    rating: number;
    text: string;
  }[];
  specifications?: { label: string; value: string }[];
  deliveryInfo?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  shippingInfo: {
    fullName: string;
    phone: string;
    address: string;
    method: "standard" | "express";
  };
  tracking: {
    status: "confirmed" | "processing" | "shipped" | "delivered";
    history: {
      status: string;
      title: string;
      description: string;
      time: string;
      date: string;
    }[];
  };
}

export type ScreenState = "product" | "cart" | "confirmation" | "tracker";
