"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChefHat, Copy, Check, AlertCircle, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { computeFees, GST_RATE } from "@/lib/fees";
import { orders as ordersApi } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { cart, clearCart, total } = useCart();

  const subscriptionType = searchParams.get("subscription"); // basic, premium, pro
  const [coupons, setCoupons] = useState([]);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [nearbyKitchens, setNearbyKitchens] = useState([]);
  const [selectedKitchenId, setSelectedKitchenId] = useState(null);
  const [kitchensLoading, setKitchensLoading] = useState(false);

  const SUBSCRIPTION_PLANS = {
    basic: {
      name: "Basic Plan",
      price: 499,
      duration: "1 Month",
      description: "₹499/month",
    },
    premium: {
      name: "Premium Plan",
      price: 999,
      duration: "1 Month",
      description: "₹999/month",
    },
    pro: {
      name: "Pro Plan",
      price: 1999,
      duration: "1 Month",
      description: "₹1999/month",
    },
  };

  const orderAmount = subscriptionType
    ? SUBSCRIPTION_PLANS[subscriptionType]?.price || 0
    : total;
  const bill = computeFees(orderAmount);
  const finalAmount = bill.grandTotal - discount;

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    if (!subscriptionType && !cart.provider?.id) {
      router.replace("/cart");
      return;
    }

    fetchCoupons();
    if (subscriptionType) {
      fetchNearbyKitchens();
    }
    setLoading(false);
  }, [user, subscriptionType, cart.provider?.id, router]);

  const fetchNearbyKitchens = useCallback(async () => {
    setKitchensLoading(true);
    try {
      const res = await fetch("/api/providers?limit=20");
      const data = await res.json();
      setNearbyKitchens(data.providers || []);
      if (data.providers?.length > 0) {
        setSelectedKitchenId(data.providers[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch kitchens:", err);
    } finally {
      setKitchensLoading(false);
    }
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      setAvailableCoupons(data.coupons || []);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    }
  }, []);

  const applyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setError(null);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          amount: bill.grandTotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid coupon");
        return;
      }

      setSelectedCoupon(data.coupon);
      setDiscount(data.discount);
      setCouponCode("");
    } catch (err) {
      setError(err.message);
    }
  };

  const initiatePayment = async () => {
    if (!user) return router.replace("/login");
    if (finalAmount <= 0) {
      setError("Invalid payment amount");
      return;
    }

    if (subscriptionType && !selectedKitchenId) {
      setError("Please select a kitchen for your subscription");
      return;
    }

    setPaying(true);
    setError(null);

    try {
      // Create order/subscription in database first
      let orderId = null;
      let subscriptionId = null;

      if (subscriptionType) {
        // Create subscription entry with kitchen
        const subRes = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: subscriptionType,
            amount: finalAmount,
            provider_id: selectedKitchenId,
            coupon_code: selectedCoupon?.code || null,
            coupon_discount: discount,
          }),
        });
        const subData = await subRes.json();
        subscriptionId = subData.subscription?.id;
      } else {
        // Create order entry
        const orderRes = await ordersApi.create({
          provider_id: cart.provider.id,
          delivery_address: cart.deliveryAddress,
          notes: cart.notes,
          items: Object.values(cart.items || {}).map(({ item, qty }) => ({
            menu_item_id: item.id,
            quantity: qty,
          })),
          total_amount: finalAmount,
          coupon_code: selectedCoupon?.code || null,
          coupon_discount: discount,
        });
        orderId = orderRes.order?.id;
      }

      // Create Razorpay order
      const razorpayRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          receipt: orderId || subscriptionId,
          description: subscriptionType
            ? `${SUBSCRIPTION_PLANS[subscriptionType].name} Payment`
            : "Food Order Payment",
        }),
      });

      const razorpayData = await razorpayRes.json();
      if (!razorpayRes.ok) {
        throw new Error(razorpayData.error);
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: razorpayData.order.id,
        amount: razorpayData.order.amount,
        currency: razorpayData.order.currency,
        name: "Mom's Magic",
        description: subscriptionType
          ? `${SUBSCRIPTION_PLANS[subscriptionType].name}`
          : "Order Payment",
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || "",
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
                subscriptionId,
              }),
            });

            if (verifyRes.ok) {
              clearCart();
              if (subscriptionType) {
                router.push("/subscriptions?success=true");
              } else {
                router.push("/orders?success=true");
              }
            } else {
              setError("Payment verification failed");
            }
          } catch (err) {
            setError(err.message);
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
        theme: {
          color: "#EA580C",
        },
      };

      // Open Razorpay checkout
      const Razorpay = window.Razorpay;
      if (!Razorpay) {
        setError("Payment gateway not available");
        return;
      }

      new Razorpay(options).open();
    } catch (err) {
      setError(err.message);
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#FCEAE1] bg-linear-to-r from-[#EA580C] to-[#F97316] text-white">
                <p className="font-heading font-bold text-lg">Your Order</p>
              </div>

              <div className="p-5 space-y-4">
                {subscriptionType ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-[#0F172A] mb-1">
                        {SUBSCRIPTION_PLANS[subscriptionType]?.name}
                      </p>
                      <p className="text-sm text-[#64748B]">
                        {SUBSCRIPTION_PLANS[subscriptionType]?.description}
                      </p>
                    </div>

                    {/* Kitchen Selection */}
                    <div className="border-t border-[#FCEAE1] pt-4">
                      <label className="block text-sm font-semibold text-[#0F172A] mb-3">
                        Select Your Kitchen
                      </label>
                      {kitchensLoading ? (
                        <div className="text-center py-4 text-[#64748B]">Loading kitchens...</div>
                      ) : nearbyKitchens.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {nearbyKitchens.map((kitchen) => (
                            <label
                              key={kitchen.id}
                              className="flex items-start gap-3 p-3 border border-[#FCEAE1] rounded-xl hover:bg-[#FDF4F0] cursor-pointer transition-colors"
                            >
                              <input
                                type="radio"
                                name="kitchen"
                                value={kitchen.id}
                                checked={selectedKitchenId === kitchen.id}
                                onChange={(e) => setSelectedKitchenId(e.target.value)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-[#0F172A]">
                                  {kitchen.kitchen_name}
                                </p>
                                <p className="text-xs text-[#64748B]">
                                  {kitchen.location}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#64748B]">No kitchens available</p>
                      )}

                      {/* Pricing Note */}
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-xs text-blue-900 font-medium">
                          💡 Want to change your taste? You can switch to a different kitchen anytime within 24 hours of subscription start.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FDF4F0] flex items-center justify-center">
                        <ChefHat
                          size={18}
                          className="text-[#EA580C]"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[#0F172A]">
                          {cart.provider?.kitchen_name}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {Object.values(cart.items || {}).length} items
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-[#FCEAE1] pt-4">
                      {Object.values(cart.items || {}).map(({ item, qty }) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm text-[#0F172A]"
                        >
                          <span>
                            {item.name} × {qty}
                          </span>
                          <span className="font-semibold">
                            ₹{item.price * qty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="border-t border-[#FCEAE1] pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Subtotal</span>
                    <span className="font-semibold text-[#0F172A]">
                      ₹{bill.subtotal}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">
                      GST ({Math.round(GST_RATE * 100)}%)
                    </span>
                    <span className="font-semibold text-[#0F172A]">
                      ₹{bill.gstAmount}
                    </span>
                  </div>
                  {!subscriptionType && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Delivery fee</span>
                      <span className="font-semibold text-[#0F172A]">
                        ₹{bill.deliveryFee}
                      </span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({selectedCoupon?.code})</span>
                      <span className="font-semibold">-₹{discount}</span>
                    </div>
                  )}
                  <div className="border-t border-[#FCEAE1] pt-2 flex justify-between">
                    <span className="font-bold text-[#0F172A]">Total</span>
                    <span className="font-bold text-[#EA580C]">
                      ₹{Math.round(finalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-6">
              {/* Coupons */}
              <div className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#FCEAE1]">
                  <p className="font-heading font-bold text-lg text-[#0F172A]">
                    Coupons
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  <form onSubmit={applyCoupon} className="space-y-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="w-full text-sm border border-[#FCEAE1] rounded-xl px-3 py-2 text-[#0F172A] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all"
                    />
                    <button
                      type="submit"
                      className="w-full text-sm font-semibold bg-[#EA580C] text-white py-2 rounded-xl hover:bg-[#C2410C] transition-colors"
                    >
                      Apply Coupon
                    </button>
                  </form>

                  {selectedCoupon && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-3">
                      <Check size={18} className="text-green-600 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-green-900">
                          {selectedCoupon.code}
                        </p>
                        <p className="text-green-700">{selectedCoupon.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCoupon(null);
                          setDiscount(0);
                        }}
                        className="ml-auto text-green-600 hover:text-green-900"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-[#64748B] mb-2">
                      Available Coupons
                    </p>
                    <div className="space-y-2">
                      {availableCoupons.map((coupon) => (
                        <button
                          key={coupon.code}
                          onClick={() => {
                            setCouponCode(coupon.code);
                          }}
                          className="w-full text-left p-3 border border-[#FCEAE1] rounded-xl hover:bg-[#FDF4F0] hover:border-[#EA580C] transition-colors"
                        >
                          <p className="text-sm font-semibold text-[#0F172A]">
                            {coupon.code}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {coupon.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#FCEAE1]">
                  <p className="font-heading font-bold text-lg text-[#0F172A]">
                    Payment Methods
                  </p>
                </div>

                <div className="p-5 space-y-3">
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-[#0F172A]">
                      Available Methods:
                    </p>
                    <ul className="text-[#64748B] space-y-1">
                      <li>💳 Credit/Debit Cards</li>
                      <li>🏦 Internet Banking</li>
                      <li>📱 Mobile Banking</li>
                      <li>UPI (Google Pay, PhonePe, Paytm, Navi, BHIM)</li>
                      <li>💰 Wallets</li>
                    </ul>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
                      <AlertCircle
                        size={16}
                        className="text-red-600 shrink-0 mt-0.5"
                      />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={initiatePayment}
                    disabled={paying || finalAmount <= 0}
                    className="w-full bg-[#EA580C] text-white font-bold py-3 rounded-xl hover:bg-[#C2410C] active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {paying ? "Processing..." : `Pay ₹${Math.round(finalAmount)}`}
                  </button>

                  <p className="text-xs text-center text-[#64748B]">
                    Secure payments powered by Razorpay
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      {/* Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
    </div>
  );
}
