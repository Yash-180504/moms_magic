"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  ChefHat,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { orders as ordersApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

function formatSavedAddress(addr) {
  if (!addr) return "";
  const parts = [
    addr.address1,
    addr.address2,
    addr.landmark,
    [addr.city, addr.state].filter(Boolean).join(", "),
    addr.pincode,
  ].filter(Boolean);
  const line = parts.join(", ");
  const meta = [addr.name, addr.phone].filter(Boolean).join(" • ");
  return [line, meta].filter(Boolean).join("\n");
}

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cart,
    itemCount,
    total,
    addItem,
    removeOne,
    removeItem,
    clearCart,
    setDeliveryAddress,
    setNotes,
  } = useCart();

  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderError, setOrderError] = useState(null);

  const entries = useMemo(() => {
    return Object.values(cart.items || {});
  }, [cart.items]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (cart.deliveryAddress?.trim()) return;

    const selected = JSON.parse(
      localStorage.getItem("mm_selected_address") || "null",
    );
    const addr = selected?.address;
    const formatted = formatSavedAddress(addr);
    if (formatted) setDeliveryAddress(formatted);
  }, [cart.deliveryAddress, setDeliveryAddress]);

  async function placeOrder(e) {
    e.preventDefault();
    if (!user) return router.push("/login");
    if (!cart.provider?.id) {
      setOrderError("Please add items from a kitchen first.");
      return;
    }
    if (!cart.deliveryAddress?.trim()) {
      setOrderError("Please enter your delivery address.");
      return;
    }
    if (!entries.length) {
      setOrderError("Your cart is empty.");
      return;
    }

    setOrdering(true);
    setOrderError(null);
    try {
      const { order } = await ordersApi.create({
        provider_id: cart.provider.id,
        delivery_address: cart.deliveryAddress,
        notes: cart.notes,
        items: entries.map(({ item, qty }) => ({
          menu_item_id: item.id,
          quantity: qty,
        })),
      });
      setOrderSuccess(order);
      clearCart();
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setOrdering(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F172A]">
                Your Cart
              </h1>
              {cart.provider?.id ? (
                <p className="text-sm text-[#64748B] mt-1">
                  From{" "}
                  <span className="font-semibold text-[#0F172A]">
                    {cart.provider.kitchen_name || "Kitchen"}
                  </span>
                  {cart.provider.location ? (
                    <span className="text-[#64748B]">
                      {" "}
                      • {cart.provider.location}
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="text-sm text-[#64748B] mt-1">
                  Add meals from a kitchen to start your order.
                </p>
              )}
            </div>

            {itemCount > 0 && !orderSuccess && (
              <button
                onClick={clearCart}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] bg-white border border-[#FCEAE1] rounded-xl px-3 py-2 hover:border-[#EA580C] hover:text-[#EA580C] transition-colors cursor-pointer"
              >
                <Trash2 size={16} /> Clear
              </button>
            )}
          </div>

          {orderSuccess ? (
            <div className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm p-6 text-center space-y-3">
              <CheckCircle size={44} className="text-green-500 mx-auto" />
              <p className="font-heading font-bold text-xl text-[#0F172A]">
                Order placed!
              </p>
              <p className="text-sm text-[#64748B]">
                Order #{orderSuccess.id.slice(0, 8)} — ₹
                {orderSuccess.total_amount}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => router.push("/orders")}
                  className="flex-1 bg-[#EA580C] text-white font-bold py-3 rounded-xl hover:bg-[#C2410C] transition-colors cursor-pointer"
                >
                  View my orders
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 bg-white border border-[#FCEAE1] text-[#0F172A] font-bold py-3 rounded-xl hover:border-[#EA580C] transition-colors cursor-pointer"
                >
                  Browse kitchens
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items */}
              <section className="lg:col-span-2">
                {entries.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm p-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#FDF4F0] flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart
                        size={22}
                        className="text-[#EA580C]"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="font-heading font-bold text-lg text-[#0F172A]">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-[#64748B] mt-1">
                      Browse kitchens and add meals to your cart.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center mt-5 bg-[#EA580C] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#C2410C] transition-colors"
                    >
                      Browse kitchens
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#FCEAE1] flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-[#FDF4F0] flex items-center justify-center">
                        <ChefHat
                          size={18}
                          className="text-[#EA580C]"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-lg text-[#0F172A] truncate">
                          Items ({itemCount})
                        </p>
                        {cart.provider?.id && (
                          <Link
                            href={`/provider/${cart.provider.id}`}
                            className="text-xs text-[#EA580C] font-semibold hover:underline"
                          >
                            Add more from this kitchen
                          </Link>
                        )}
                      </div>
                    </div>

                    <ul className="divide-y divide-[#FCEAE1]">
                      {entries.map(({ item, qty }) => (
                        <li
                          key={item.id}
                          className="p-4 sm:p-5 flex items-center gap-4"
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FDF4F0] shrink-0 flex items-center justify-center">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ChefHat
                                size={20}
                                className="text-[#EA580C]"
                                aria-hidden="true"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#0F172A] truncate">
                              {item.name}
                            </p>
                            <p className="text-sm text-[#64748B]">
                              ₹{item.price} each
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => removeOne(item.id)}
                              className="w-9 h-9 rounded-xl bg-[#FDF4F0] text-[#EA580C] flex items-center justify-center hover:bg-[#EA580C] hover:text-white transition-colors cursor-pointer"
                              aria-label="Remove one"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center font-bold text-[#0F172A]">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => addItem(cart.provider, item)}
                              className="w-9 h-9 rounded-xl bg-[#EA580C] text-white flex items-center justify-center hover:bg-[#C2410C] transition-colors cursor-pointer"
                              aria-label="Add one"
                            >
                              <Plus size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="ml-1 text-[#64748B] hover:text-red-600 transition-colors cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <div className="w-20 text-right font-bold text-[#0F172A] shrink-0">
                            ₹{item.price * qty}
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="px-5 py-4 border-t border-[#FCEAE1] flex items-center justify-between">
                      <span className="font-bold text-[#0F172A]">Total</span>
                      <span className="font-bold text-[#EA580C]">₹{total}</span>
                    </div>
                  </div>
                )}
              </section>

              {/* Checkout */}
              <aside className="lg:col-span-1">
                <div className="lg:sticky lg:top-20 bg-white rounded-2xl border border-[#FCEAE1] shadow-sm overflow-hidden">
                  <div className="px-5 py-4 bg-linear-to-r from-[#EA580C] to-[#F97316] text-white">
                    <p className="font-heading font-bold text-lg">Checkout</p>
                    <p className="text-white/80 text-xs mt-0.5">
                      Fast delivery, freshly cooked.
                    </p>
                  </div>

                  <form onSubmit={placeOrder} className="p-5 space-y-4">
                    <div>
                      <label
                        htmlFor="delivery-address"
                        className="block text-xs font-semibold text-[#0F172A] mb-1"
                      >
                        Delivery Address{" "}
                        <span className="text-red-500" aria-hidden="true">
                          *
                        </span>
                      </label>
                      <textarea
                        id="delivery-address"
                        rows={3}
                        value={cart.deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Flat / building, street, city…"
                        className="w-full text-sm border border-[#FCEAE1] rounded-xl px-3 py-2 text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all resize-none"
                        required
                      />
                      <p className="text-[11px] text-[#64748B] mt-1">
                        Tip: use Address Book in the top bar to save and
                        auto-fill.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="order-notes"
                        className="block text-xs font-semibold text-[#0F172A] mb-1"
                      >
                        Notes (optional)
                      </label>
                      <input
                        id="order-notes"
                        type="text"
                        value={cart.notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Spice level, allergies…"
                        className="w-full text-sm border border-[#FCEAE1] rounded-xl px-3 py-2 text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all"
                      />
                    </div>

                    {orderError && (
                      <p
                        className="text-xs text-red-600 flex items-center gap-1"
                        role="alert"
                      >
                        <AlertCircle size={13} /> {orderError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={ordering || entries.length === 0}
                      className="w-full bg-[#EA580C] text-white font-bold py-3 rounded-xl hover:bg-[#C2410C] active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {ordering
                        ? "Placing order…"
                        : user
                          ? `Place Order — ₹${total}`
                          : "Log in to order"}
                    </button>

                    {!user && (
                      <p className="text-xs text-[#64748B] text-center">
                        You’ll need to log in before placing an order.
                      </p>
                    )}
                  </form>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
