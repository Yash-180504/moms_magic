"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function BottomNav() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/?search=1", icon: Search, label: "Search", isSearch: true },
    ...(!user || user?.role === "customer" || user?.role === "admin"
      ? [{ href: "/cart", icon: ShoppingCart, label: "Cart", isCart: true }]
      : []),
    ...(user?.role === "customer"
      ? [{ href: "/orders", icon: ShoppingBag, label: "Orders" }]
      : []),
    ...(user?.role === "provider" || user?.role === "admin"
      ? [{ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }]
      : []),
    {
      href: "/profile",
      icon: User,
      label: user ? user.name.split(" ")[0] : "Log in",
    },
  ];

  function isActive(tab) {
    if (tab.isSearch) return false;
    if (tab.href === "/") return pathname === "/";
    return pathname.startsWith(tab.href);
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#FCEAE1]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Bottom navigation"
    >
      <div className="flex items-stretch justify-around h-14">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-semibold transition-colors min-w-0 relative ${active ? "text-[#EA580C]" : "text-[#64748B]"}`}
              aria-current={active ? "page" : undefined}
            >
              <tab.icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                aria-hidden="true"
              />
              <span className="truncate max-w-12.5 text-center">
                {tab.label}
              </span>
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#EA580C] rounded-full"
                  aria-hidden="true"
                />
              )}
              {mounted && tab.isCart && cartCount > 0 && (
                <span className="absolute top-1 right-4 min-w-4 h-4 px-1 rounded-full bg-[#EA580C] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
