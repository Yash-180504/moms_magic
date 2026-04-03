"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Star,
  Clock,
  ShieldCheck,
  ChefHat,
  Leaf,
  Drumstick,
  ShoppingCart,
  Plus,
  Minus,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { providers as providersApi, menu as menuApi } from "@/lib/api";
import { computeFees } from "@/lib/fees";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useCart } from "@/context/CartContext";

function gradient(id = "") {
  const hues = [24, 142, 45, 0, 220, 280];
  const idx = (id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % hues.length;
  return `hsl(${hues[idx]},75%,55%), hsl(${hues[idx] + 20},80%,40%)`;
}

export default function ProviderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { cart, itemCount, total, addItem, removeOne, getQty } = useCart();

  const bill = computeFees(total);

  const [provider, setProvider] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [pData, mData] = await Promise.all([
        providersApi.get(id),
        menuApi.list(id),
      ]);
      setProvider(pData.provider);
      setMenuItems(mData.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);
  useAutoRefresh(load);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 px-4">
          <AlertCircle size={40} className="text-red-500" />
          <p className="text-[#0F172A] font-semibold">
            {error || "Provider not found"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-[#EA580C] hover:underline cursor-pointer"
          >
            ← Back to kitchens
          </button>
        </div>
      </div>
    );
  }

  const vegItems = menuItems.filter((m) => m.is_veg);
  const nonvegItems = menuItems.filter((m) => !m.is_veg);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
      <Navbar />

      <main>
        {/* Header */}
        <div
          className="h-56 sm:h-72 relative"
          style={{
            background: provider.cover_image_url
              ? `url(${provider.cover_image_url}) center/cover`
              : `linear-gradient(135deg, ${gradient(provider.id)})`,
          }}
          role="img"
          aria-label={`${provider.kitchen_name} cover`}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="max-w-6xl mx-auto flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {provider.is_verified && (
                    <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  )}
                </div>
                <h1 className="font-heading font-bold text-3xl sm:text-4xl">
                  {provider.kitchen_name}
                </h1>
                <div className="flex items-center gap-3 mt-1 text-white/80 text-sm flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {provider.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {Number(provider.rating).toFixed(1)} (
                    {provider.total_orders} orders)
                  </span>
                  {provider.delivery_time && (
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {provider.delivery_time}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-2xl font-bold shrink-0">
                ₹{provider.price_from}
                <span className="text-base font-normal text-white/70">
                  /meal
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 gap-8">
          {/* Menu */}
          <div className="space-y-8">
            {provider.description && (
              <p className="text-[#64748B] leading-relaxed">
                {provider.description}
              </p>
            )}

            {menuItems.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#FCEAE1]">
                <ChefHat size={36} className="text-[#EA580C] mx-auto mb-3" />
                <p className="font-heading font-bold text-lg text-[#0F172A]">
                  Menu coming soon
                </p>
                <p className="text-sm text-[#64748B] mt-1">
                  This kitchen hasn&apos;t added their menu yet.
                </p>
              </div>
            )}

            {vegItems.length > 0 && (
              <MenuSection
                title="Veg Items"
                icon={<Leaf size={16} className="text-green-600" />}
                items={vegItems}
                getQty={getQty}
                onAdd={(item) => addItem(provider, item)}
                onRemove={(itemId) => removeOne(itemId)}
              />
            )}
            {nonvegItems.length > 0 && (
              <MenuSection
                title="Non-Veg Items"
                icon={<Drumstick size={16} className="text-red-600" />}
                items={nonvegItems}
                getQty={getQty}
                onAdd={(item) => addItem(provider, item)}
                onRemove={(itemId) => removeOne(itemId)}
              />
            )}
          </div>
        </div>

        {itemCount > 0 && (
          <div
            className="fixed left-0 right-0 bottom-14 md:bottom-0 z-30 px-4 pb-3"
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
            }}
          >
            <div className="max-w-6xl mx-auto">
              <button
                onClick={() => router.push("/cart")}
                className="w-full bg-white border border-[#FCEAE1] rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 hover:border-[#EA580C] transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#FDF4F0] flex items-center justify-center">
                  <ShoppingCart
                    size={18}
                    className="text-[#EA580C]"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-bold text-[#0F172A] truncate">View cart</p>
                  <p className="text-xs text-[#64748B] truncate">
                    {cart.provider?.id === id
                      ? `${itemCount} item${itemCount === 1 ? "" : "s"} • ₹${bill.grandTotal}`
                      : `${itemCount} item${itemCount === 1 ? "" : "s"} in cart from another kitchen`}
                  </p>
                </div>
                <span className="font-bold text-[#EA580C]">
                  ₹{bill.grandTotal}
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function MenuSection({ title, icon, items, getQty, onAdd, onRemove }) {
  return (
    <div>
      <h2 className="font-heading font-bold text-xl text-[#0F172A] flex items-center gap-2 mb-4">
        {icon} {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
        {items.map((item) => {
          const qty = getQty(item.id);
          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border border-[#FCEAE1] overflow-hidden flex flex-col ${!item.is_available ? "opacity-50" : ""}`}
            >
              {/* Image */}
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-28 sm:h-20 object-cover"
                />
              ) : (
                <div className="w-full h-28 sm:h-20 bg-[#FDF4F0] flex items-center justify-center">
                  <ChefHat
                    size={28}
                    className="text-[#EA580C]"
                    aria-hidden="true"
                  />
                </div>
              )}

              {/* Body */}
              <div className="p-2.5 sm:p-4 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4 flex-1">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-[#0F172A] text-sm leading-tight">
                      {item.name}
                    </p>
                    {!item.is_available && (
                      <span className="text-[10px] text-[#64748B]">
                        Unavailable
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2 sm:line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {item.category && (
                    <span className="inline-block text-[10px] bg-[#FDF4F0] text-[#EA580C] px-1.5 py-0.5 rounded-full mt-1">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Price + Add — stacked on mobile, row on sm+ */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1.5 mt-1 sm:mt-0">
                  <span className="font-bold text-[#EA580C] text-sm">
                    ₹{item.price}
                  </span>
                  {item.is_available &&
                    (qty ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onRemove(item.id)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FDF4F0] text-[#EA580C] flex items-center justify-center cursor-pointer hover:bg-[#EA580C] hover:text-white transition-colors"
                          aria-label="Remove one"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-4 text-center font-bold text-[#0F172A] text-sm">
                          {qty}
                        </span>
                        <button
                          onClick={() => onAdd(item)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EA580C] text-white flex items-center justify-center cursor-pointer hover:bg-[#C2410C] transition-colors"
                          aria-label="Add one more"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAdd(item)}
                        className="flex items-center gap-1 bg-[#EA580C] text-white text-[11px] sm:text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-[#C2410C] active:scale-95 transition-all cursor-pointer"
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <Plus size={11} /> Add
                      </button>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
