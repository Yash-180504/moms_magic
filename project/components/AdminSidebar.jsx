"use client";

import {
  LayoutDashboard,
  Users,
  ChefHat,
  ShoppingBag,
  Settings,
  LogOut,
  BarChart3,
  FileText,
} from "lucide-react";
import Link from "next/link";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin?tab=dashboard",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    href: "/admin?tab=analytics",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBag,
    href: "/admin?tab=orders",
  },
  {
    id: "providers",
    label: "Providers",
    icon: ChefHat,
    href: "/admin?tab=providers",
  },
  { id: "users", label: "Users", icon: Users, href: "/admin?tab=users" },
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    href: "/admin?tab=reports",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/admin?tab=settings",
  },
];

export default function AdminSidebar({ activeTab, onLogout }) {
  return (
    <aside className="w-64 bg-white border-r border-[#FCEAE1] h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-[#FCEAE1]">
        <h2 className="text-xl font-bold text-[#EA580C]">Mom's Magic</h2>
        <p className="text-xs text-[#64748B] mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-[#EA580C] text-white shadow-sm"
                  : "text-[#64748B] hover:bg-[#FFF7ED] hover:text-[#EA580C]"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#FCEAE1]">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all w-full"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
