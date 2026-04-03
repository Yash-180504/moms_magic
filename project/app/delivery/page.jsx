"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { delivery } from "@/lib/api";

function safeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDateTime(value) {
  const date = safeDate(value);
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function getStatusMeta(statusRaw) {
  const status = String(statusRaw || "").toLowerCase();
  if (["delivered", "completed", "success"].includes(status)) {
    return {
      label: statusRaw || "Delivered",
      Icon: CheckCircle,
      className: "bg-green-50 text-green-700 border-green-200",
    };
  }
  if (["cancelled", "canceled", "failed"].includes(status)) {
    return {
      label: statusRaw || "Cancelled",
      Icon: XCircle,
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }
  if (["out_for_delivery"].includes(status)) {
    return {
      label: statusRaw || "Out for delivery",
      Icon: Package,
      className: "bg-purple-50 text-purple-700 border-purple-200",
    };
  }
  if (
    ["confirmed", "preparing", "pending", "placed", "processing"].includes(
      status,
    )
  ) {
    return {
      label: statusRaw || "Active",
      Icon: Clock,
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  return {
    label: statusRaw || "Unknown",
    Icon: AlertCircle,
    className: "bg-slate-50 text-slate-700 border-slate-200",
  };
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="bg-white border border-[#FCEAE1] rounded-2xl p-8 text-center">
      <p className="text-base font-semibold text-[#0F172A]">{title}</p>
      {subtitle ? (
        <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>
      ) : null}
    </div>
  );
}

export default function DeliveryDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canView = useMemo(
    () => Boolean(user && user.role === "delivery_partner"),
    [user],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "delivery_partner") {
      router.replace(user.role === "provider" ? "/dashboard" : "/");
    }
  }, [authLoading, user, router]);

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      const data = await delivery.availableOrders();
      setOrders(data.orders || []);
    } catch (e) {
      setError(e?.message || "Failed to load available orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canView) return;
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  if (authLoading || (!user && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#EA580C] border-t-transparent" />
      </div>
    );
  }

  if (!canView) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b border-[#FCEAE1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
              Delivery Dashboard
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Available orders from providers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchOrders}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EA580C] text-white font-semibold hover:bg-[#C2410C] transition-all disabled:opacity-60"
            >
              <RefreshCcw size={16} />
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <Link
              href="/"
              className="text-sm font-semibold text-[#EA580C] hover:text-[#C2410C]"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {error ? (
          <div className="bg-white border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#EA580C] border-t-transparent" />
          </div>
        ) : orders.length ? (
          <div className="bg-white border border-[#FCEAE1] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#FFF7ED]">
                  <tr className="text-left text-xs text-[#64748B]">
                    <th className="py-3 px-5">Order</th>
                    <th className="py-3 px-5">Kitchen</th>
                    <th className="py-3 px-5">Delivery</th>
                    <th className="py-3 px-5">Customer</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const meta = getStatusMeta(order.status);
                    return (
                      <tr key={order.id} className="border-t border-[#FCEAE1]">
                        <td className="py-4 px-5 font-semibold text-[#0F172A]">
                          #{order.id}
                        </td>
                        <td className="py-4 px-5">
                          <div className="text-[#0F172A] font-medium">
                            {order.kitchen_name || "—"}
                          </div>
                          {order.provider_location ? (
                            <div className="text-xs text-[#64748B] inline-flex items-center gap-1 mt-1">
                              <MapPin size={12} />
                              {order.provider_location}
                            </div>
                          ) : null}
                        </td>
                        <td className="py-4 px-5 text-[#0F172A]">
                          {order.delivery_address || "—"}
                        </td>
                        <td className="py-4 px-5">
                          <div className="text-[#0F172A] font-medium">
                            {order.customer_name || "—"}
                          </div>
                          <div className="mt-1 flex flex-col gap-1 text-xs text-[#64748B]">
                            {order.customer_phone ? (
                              <span className="inline-flex items-center gap-1">
                                <Phone size={12} />
                                {order.customer_phone}
                              </span>
                            ) : null}
                            {order.customer_email ? (
                              <span className="inline-flex items-center gap-1">
                                <Mail size={12} />
                                {order.customer_email}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${meta.className}`}
                          >
                            <meta.Icon size={14} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-[#64748B]">
                          {formatDateTime(order.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No available orders"
            subtitle="Orders will show here once customers place them (pending) and as providers progress them."
          />
        )}
      </main>
    </div>
  );
}
