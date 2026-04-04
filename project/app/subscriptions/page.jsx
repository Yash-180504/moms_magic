"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

const PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 499,
    duration: "1 Month",
    description: "Perfect for students",
    features: [
      "10 orders per month",
      "5% discount on all orders",
      "24/7 customer support",
      "Free delivery on orders above ₹300",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 999,
    duration: "1 Month",
    description: "Most popular",
    features: [
      "Unlimited orders per month",
      "15% discount on all orders",
      "Free delivery on all orders",
      "Priority customer support",
      "Early access to new menus",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: 1999,
    duration: "1 Month",
    description: "For food lovers",
    features: [
      "Unlimited orders",
      "25% discount on all orders",
      "Free delivery on all orders",
      "24/7 VIP support",
      "Early access to everything",
      "Monthly gift voucher ₹500",
      "Exclusive menu items",
    ],
  },
];

export default function PlansPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { addSubscription } = useCart();
  const [addedPlan, setAddedPlan] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const handleChoosePlan = (planId) => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    const plan = PLANS.find((p) => p.id === planId);
    if (plan) {
      addSubscription({
        type: planId,
        name: plan.name,
        price: plan.price,
        duration: plan.duration,
      });
      setAddedPlan(planId);
      setTimeout(() => setAddedPlan(null), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
      <Navbar />

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl text-[#0F172A] mb-4">
              Subscription Plans
            </h1>
            <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
              Choose a plan and save more on your favorite home-cooked meals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl border-2 overflow-hidden transition-all ${
                  plan.popular
                    ? "border-[#EA580C] shadow-xl scale-105"
                    : "border-[#FCEAE1] shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="bg-[#EA580C] text-white text-center py-2 text-sm font-bold">
                    🌟 Most Popular
                  </div>
                )}

                <div
                  className={`p-8 ${
                    plan.popular ? "bg-white" : "bg-[#FFF7ED]"
                  }`}
                >
                  <h3 className="font-heading font-bold text-2xl text-[#0F172A] mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[#64748B] mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-5xl font-bold text-[#0F172A]">
                      ₹{plan.price}
                    </span>
                    <span className="text-[#64748B] ml-2">/{plan.duration}</span>
                  </div>

                  <button
                    onClick={() => handleChoosePlan(plan.id)}
                    className={`w-full font-bold py-3 rounded-xl transition-all mb-8 cursor-pointer flex items-center justify-center gap-2 ${
                      addedPlan === plan.id
                        ? plan.popular
                          ? "bg-green-600 text-white"
                          : "bg-green-600 text-white border-2 border-green-600"
                        : plan.popular
                        ? "bg-[#EA580C] text-white hover:bg-[#C2410C]"
                        : "bg-white border-2 border-[#EA580C] text-[#EA580C] hover:bg-[#FDF4F0]"
                    }`}
                  >
                    {addedPlan === plan.id ? (
                      <>
                        <ShoppingCart size={18} />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      "Choose Plan"
                    )}
                  </button>

                  <div className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3"
                      >
                        <Check
                          size={20}
                          className="text-green-600 shrink-0 mt-0.5"
                        />
                        <span className="text-[#0F172A] text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison */}
          <div className="mt-16">
            <h2 className="font-heading font-bold text-3xl text-[#0F172A] mb-8 text-center">
              Plan Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDF4F0]">
                    <th className="px-4 py-3 font-bold text-[#0F172A]">Feature</th>
                    <th className="px-4 py-3 font-bold text-[#0F172A]">Basic</th>
                    <th className="px-4 py-3 font-bold text-[#0F172A]">Premium</th>
                    <th className="px-4 py-3 font-bold text-[#0F172A]">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FCEAE1]">
                  <tr>
                    <td className="px-4 py-3 text-[#0F172A]">Orders per month</td>
                    <td className="px-4 py-3 text-[#64748B]">10</td>
                    <td className="px-4 py-3 text-[#64748B]">Unlimited</td>
                    <td className="px-4 py-3 text-[#64748B]">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-[#0F172A]">Discount</td>
                    <td className="px-4 py-3 text-[#64748B]">5%</td>
                    <td className="px-4 py-3 text-[#64748B]">15%</td>
                    <td className="px-4 py-3 text-[#64748B]">25%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-[#0F172A]">Free delivery</td>
                    <td className="px-4 py-3">Above ₹300</td>
                    <td className="px-4 py-3">
                      <Check size={20} className="text-green-600" />
                    </td>
                    <td className="px-4 py-3">
                      <Check size={20} className="text-green-600" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-[#0F172A]">Support</td>
                    <td className="px-4 py-3 text-[#64748B]">Standard</td>
                    <td className="px-4 py-3 text-[#64748B]">Priority</td>
                    <td className="px-4 py-3 text-[#64748B]">VIP 24/7</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-[#0F172A]">Early access</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3">
                      <Check size={20} className="text-green-600" />
                    </td>
                    <td className="px-4 py-3">
                      <Check size={20} className="text-green-600" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-[#0F172A]">Monthly gift</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3 text-[#64748B]">₹500 voucher</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
