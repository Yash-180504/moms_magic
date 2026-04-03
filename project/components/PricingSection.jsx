"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";

const DURATIONS = [
  { days: 7, label: "7 Days" },
  { days: 15, label: "15 Days" },
  { days: 30, label: "30 Days" },
];

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    description: "One meal a day for steady routines.",
    dailyPrice: 85,
    features: [
      "1 meal/day",
      "Daily fresh delivery",
      "Skip days anytime",
      "Support via WhatsApp",
    ],
    accent: "text-[#0F172A]",
  },
  {
    id: "standard",
    name: "Standard",
    description: "Most popular — lunch + dinner comfort.",
    dailyPrice: 150,
    features: [
      "2 meals/day",
      "Priority delivery slot",
      "Menu variety",
      "Easy plan pause",
    ],
    accent: "text-[#EA580C]",
    featured: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Family-ready value with maximum flexibility.",
    dailyPrice: 220,
    features: [
      "Up to 3 meals/day",
      "Best value for families",
      "Priority support",
      "Flexible substitutions",
    ],
    accent: "text-[#0F172A]",
  },
];

function formatMoney(value) {
  const numberValue = Number(value || 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numberValue);
  } catch {
    return `₹${Math.round(numberValue)}`;
  }
}

function getDiscountFactor(days) {
  if (days >= 30) return 0.9;
  if (days >= 15) return 0.95;
  return 1;
}

export default function PricingSection() {
  const [days, setDays] = useState(15);

  const discountFactor = useMemo(() => getDiscountFactor(days), [days]);

  return (
    <section
      className="bg-[#FFF7ED] py-16 px-4 sm:px-6 lg:px-8"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2
              id="pricing-heading"
              className="font-heading font-bold text-3xl sm:text-4xl text-[#0F172A]"
            >
              Pricing
            </h2>
            <p className="mt-3 text-[#64748B] text-base max-w-xl">
              Choose a subscription that matches your routine. Switch duration
              to see updated pricing.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <div
              className="grid grid-cols-3 bg-white border border-[#FCEAE1] rounded-xl p-1 shadow-sm"
              role="tablist"
              aria-label="Pricing duration"
            >
              {DURATIONS.map((d) => {
                const active = d.days === days;
                return (
                  <button
                    key={d.days}
                    type="button"
                    onClick={() => setDays(d.days)}
                    className={`text-sm font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] ${
                      active
                        ? "bg-[#EA580C] text-white"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                    role="tab"
                    aria-selected={active}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-[#64748B]">
              Longer durations automatically apply a discount.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const total = Math.round(plan.dailyPrice * days * discountFactor);
            const perDay = Math.round(total / days);

            return (
              <div
                key={plan.id}
                className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col ${
                  plan.featured ? "border-[#EA580C]" : "border-[#FCEAE1]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`font-heading font-bold text-xl ${plan.accent}`}
                    >
                      {plan.name}
                    </p>
                    <p className="mt-1 text-sm text-[#64748B]">
                      {plan.description}
                    </p>
                  </div>
                  {plan.featured ? (
                    <span className="shrink-0 text-xs font-bold bg-[#EA580C]/10 text-[#EA580C] px-3 py-1 rounded-full">
                      Most popular
                    </span>
                  ) : null}
                </div>

                <div className="mt-6">
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-[#0F172A]">
                      {formatMoney(total)}
                    </p>
                    <p className="text-sm text-[#64748B]">/ {days} days</p>
                  </div>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Approx. {formatMoney(perDay)} per day
                  </p>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-[#0F172A]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0">
                        <Check size={14} aria-hidden="true" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7">
                  <button
                    type="button"
                    className={`w-full px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer active:scale-95 ${
                      plan.featured
                        ? "bg-[#EA580C] text-white hover:bg-[#C2410C]"
                        : "bg-[#FFF7ED] text-[#EA580C] hover:bg-[#FDF4F0]"
                    }`}
                  >
                    Choose {plan.name}
                  </button>
                  <p className="mt-2 text-xs text-[#64748B] text-center">
                    No commitment — change anytime.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
