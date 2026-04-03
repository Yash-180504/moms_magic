"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { admin } from "@/lib/api";
import AdminSidebar from "@/components/AdminSidebar";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ChefHat,
  Eye,
  EyeOff,
  BarChart3,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const STORAGE_KEY = "mm_admin_token";

function formatMoney(value) {
  const numberValue = Number(value || 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numberValue);
  } catch {
    return `₹${numberValue.toFixed(0)}`;
  }
}

function formatCount(value) {
  const numberValue = Number(value || 0);
  try {
    return new Intl.NumberFormat(undefined).format(numberValue);
  } catch {
    return String(numberValue);
  }
}

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
  if (["completed", "delivered", "success"].includes(status)) {
    return {
      label: statusRaw || "Completed",
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
  if (["pending", "placed", "processing"].includes(status)) {
    return {
      label: statusRaw || "Pending",
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

function StatCard({ title, value, icon: Icon, trend }) {
  const TrendIcon = trend?.direction === "down" ? TrendingDown : TrendingUp;
  const trendColor =
    trend?.direction === "down" ? "text-red-600" : "text-green-600";
  return (
    <div className="bg-white border border-[#FCEAE1] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#64748B]">{title}</p>
          <p className="mt-1 text-2xl font-bold text-[#0F172A]">{value}</p>
          {trend ? (
            <div
              className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendColor}`}
            >
              <TrendIcon size={14} />
              <span>{trend.label}</span>
            </div>
          ) : null}
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function DashboardView({ summary, orders, providers, users }) {
  const salesSeries = useMemo(() => {
    const days = 14;
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const byKey = new Map();
    for (let i = 0; i < days; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      const label = day.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
      });
      byKey.set(key, { key, date: label, sales: 0, orders: 0 });
    }

    for (const order of orders || []) {
      const date = safeDate(order.created_at);
      if (!date) continue;
      const key = date.toISOString().slice(0, 10);
      const row = byKey.get(key);
      if (!row) continue;
      row.sales += Number(order.total_amount || 0);
      row.orders += 1;
    }

    return Array.from(byKey.values());
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const counts = new Map();
    for (const order of orders || []) {
      const status = String(order.status || "unknown");
      counts.set(status, (counts.get(status) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  const usersByRole = useMemo(() => {
    const counts = new Map();
    for (const user of users || []) {
      const role = String(user.role || "unknown");
      counts.set(role, (counts.get(role) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([role, value]) => ({
      role,
      value,
    }));
  }, [users]);

  const topProvidersBySales = useMemo(() => {
    const map = new Map();
    for (const order of orders || []) {
      const name = String(order.kitchen_name || "Unknown kitchen");
      map.set(name, (map.get(name) || 0) + Number(order.total_amount || 0));
    }
    return Array.from(map.entries())
      .map(([name, sales]) => ({ name, sales: Math.round(sales) }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orders]);

  const recentOrders = useMemo(() => (orders || []).slice(0, 6), [orders]);

  if (!summary) {
    return (
      <EmptyState
        title="No admin data yet"
        subtitle="Once orders/users exist, dashboard analytics will appear here."
      />
    );
  }

  const pieColors = ["#EA580C", "#0F172A", "#64748B", "#C2410C", "#FED7AA"];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Summary analytics for the last 14 days (based on recent orders)
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#64748B] bg-white border border-[#FCEAE1] rounded-xl px-3 py-2">
          <Calendar size={14} />
          <span>Updated just now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value={formatMoney(summary.total_sales)}
          icon={DollarSign}
        />
        <StatCard
          title="Total Orders"
          value={formatCount(summary.total_orders)}
          icon={Package}
        />
        <StatCard
          title="Active Providers"
          value={formatCount(summary.active_providers)}
          icon={ChefHat}
        />
        <StatCard
          title="Customers"
          value={formatCount(summary.total_customers)}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white border border-[#FCEAE1] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">
                Sales trend
              </p>
              <p className="text-xs text-[#64748B]">
                Daily sales and order counts
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <BarChart3 size={14} />
              <span>14 days</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesSeries}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#FCEAE1" />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#64748B" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#EA580C"
                  fill="url(#salesFill)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#0F172A"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#FCEAE1] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#0F172A]">Users by role</p>
          <p className="text-xs text-[#64748B]">Based on latest users list</p>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={usersByRole}
                  dataKey="value"
                  nameKey="role"
                  outerRadius={85}
                  innerRadius={55}
                >
                  {usersByRole.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.role}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-[#FCEAE1] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#0F172A]">
            Orders by status
          </p>
          <p className="text-xs text-[#64748B]">
            Distribution of recent orders
          </p>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ordersByStatus}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#FCEAE1" />
                <XAxis
                  dataKey="status"
                  stroke="#64748B"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Orders"
                  fill="#EA580C"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#FCEAE1] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#0F172A]">
            Top kitchens (sales)
          </p>
          <p className="text-xs text-[#64748B]">Top 5 by total sales</p>
          {topProvidersBySales.length ? (
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProvidersBySales}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#FCEAE1" />
                  <XAxis
                    type="number"
                    stroke="#64748B"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748B"
                    tick={{ fontSize: 12 }}
                    width={120}
                  />
                  <Tooltip formatter={(v) => formatMoney(v)} />
                  <Bar
                    dataKey="sales"
                    name="Sales"
                    fill="#0F172A"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="No sales yet"
                subtitle="Once orders are placed, top kitchens will show up here."
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#FCEAE1] rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">
              Recent orders
            </p>
            <p className="text-xs text-[#64748B]">Latest 6 orders</p>
          </div>
          <a
            href="/admin?tab=orders"
            className="text-sm font-semibold text-[#EA580C] hover:text-[#C2410C]"
          >
            View all
          </a>
        </div>

        {recentOrders.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#64748B]">
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2 pr-4">Kitchen</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Placed</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const meta = getStatusMeta(order.status);
                  return (
                    <tr key={order.id} className="border-t border-[#FCEAE1]">
                      <td className="py-3 pr-4 font-medium text-[#0F172A]">
                        #{order.id}
                      </td>
                      <td className="py-3 pr-4 text-[#0F172A]">
                        {order.kitchen_name || "—"}
                      </td>
                      <td className="py-3 pr-4 text-[#0F172A]">
                        {order.customer_name || order.customer_email || "—"}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-[#0F172A]">
                        {formatMoney(order.total_amount)}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${meta.className}`}
                        >
                          <meta.Icon size={14} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3 text-[#64748B]">
                        {formatDateTime(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No orders yet"
              subtitle="Orders will appear here once customers start ordering."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsView({ summary, orders, providers }) {
  const ordersByDay = useMemo(() => {
    const days = 30;
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const byKey = new Map();
    for (let i = 0; i < days; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      const label = day.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
      });
      byKey.set(key, { key, date: label, orders: 0 });
    }

    for (const order of orders || []) {
      const date = safeDate(order.created_at);
      if (!date) continue;
      const key = date.toISOString().slice(0, 10);
      const row = byKey.get(key);
      if (!row) continue;
      row.orders += 1;
    }

    return Array.from(byKey.values());
  }, [orders]);

  const providerActivation = useMemo(() => {
    const active = (providers || []).filter((p) => Boolean(p.is_active)).length;
    const inactive = Math.max(0, (providers || []).length - active);
    return [
      { name: "Active", value: active },
      { name: "Inactive", value: inactive },
    ];
  }, [providers]);

  if (!summary) {
    return (
      <EmptyState
        title="No analytics available"
        subtitle="Once data is available, analytics will show here."
      />
    );
  }

  const pieColors = ["#EA580C", "#64748B"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Analytics</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Deeper insights across orders and providers
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white border border-[#FCEAE1] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#0F172A]">Orders volume</p>
          <p className="text-xs text-[#64748B]">
            Daily order count (last 30 days)
          </p>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ordersByDay}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#FCEAE1" />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#EA580C"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#FCEAE1] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#0F172A]">
            Provider activity
          </p>
          <p className="text-xs text-[#64748B]">Active vs inactive kitchens</p>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={providerActivation}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  innerRadius={55}
                >
                  {providerActivation.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersView({ orders }) {
  const rows = orders || [];
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Orders</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Showing {formatCount(rows.length)} recent orders
          </p>
        </div>
      </div>

      {rows.length ? (
        <div className="bg-white border border-[#FCEAE1] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#FFF7ED]">
                <tr className="text-left text-xs text-[#64748B]">
                  <th className="py-3 px-5">Order</th>
                  <th className="py-3 px-5">Kitchen</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Total</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Placed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => {
                  const meta = getStatusMeta(order.status);
                  return (
                    <tr key={order.id} className="border-t border-[#FCEAE1]">
                      <td className="py-4 px-5 font-semibold text-[#0F172A]">
                        #{order.id}
                      </td>
                      <td className="py-4 px-5 text-[#0F172A]">
                        {order.kitchen_name || "—"}
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-[#0F172A] font-medium">
                          {order.customer_name || "—"}
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {order.customer_email || "—"}
                        </div>
                      </td>
                      <td className="py-4 px-5 font-semibold text-[#0F172A]">
                        {formatMoney(order.total_amount)}
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
          title="No orders found"
          subtitle="Orders will appear here once customers place them."
        />
      )}
    </div>
  );
}

function ProvidersView({ providers }) {
  const rows = providers || [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Providers</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Showing {formatCount(rows.length)} kitchens
        </p>
      </div>

      {rows.length ? (
        <div className="bg-white border border-[#FCEAE1] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#FFF7ED]">
                <tr className="text-left text-xs text-[#64748B]">
                  <th className="py-3 px-5">Kitchen</th>
                  <th className="py-3 px-5">Owner</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const isActive = Boolean(p.is_active);
                  return (
                    <tr key={p.id} className="border-t border-[#FCEAE1]">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-[#0F172A]">
                          {p.kitchen_name || p.name || `Kitchen #${p.id}`}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B]">
                          {p.location ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={12} />
                              {p.location}
                            </span>
                          ) : null}
                          {p.phone ? (
                            <span className="inline-flex items-center gap-1">
                              <Phone size={12} />
                              {p.phone}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-[#0F172A] font-medium">
                          {p.owner_name || "—"}
                        </div>
                        <div className="text-xs text-[#64748B] inline-flex items-center gap-1">
                          <Mail size={12} />
                          {p.owner_email || "—"}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${
                            isActive
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-[#64748B]">
                        {formatDateTime(p.created_at)}
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
          title="No providers found"
          subtitle="Providers (kitchens) will appear once they register."
        />
      )}
    </div>
  );
}

function UsersView({ users }) {
  const rows = users || [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Users</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Showing {formatCount(rows.length)} users
        </p>
      </div>

      {rows.length ? (
        <div className="bg-white border border-[#FCEAE1] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#FFF7ED]">
                <tr className="text-left text-xs text-[#64748B]">
                  <th className="py-3 px-5">Name</th>
                  <th className="py-3 px-5">Email</th>
                  <th className="py-3 px-5">Role</th>
                  <th className="py-3 px-5">Joined</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-t border-[#FCEAE1]">
                    <td className="py-4 px-5 font-semibold text-[#0F172A]">
                      {u.name || "—"}
                    </td>
                    <td className="py-4 px-5 text-[#0F172A]">
                      {u.email || "—"}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]">
                        {u.role || "—"}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[#64748B]">
                      {formatDateTime(u.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No users found"
          subtitle="Users will appear once they register."
        />
      )}
    </div>
  );
}

function ReportsView({ summary, orders }) {
  const topCustomers = useMemo(() => {
    const map = new Map();
    for (const order of orders || []) {
      const key = String(
        order.customer_email || order.customer_name || "Unknown",
      );
      const current = map.get(key) || { customer: key, orders: 0, spend: 0 };
      current.orders += 1;
      current.spend += Number(order.total_amount || 0);
      map.set(key, current);
    }
    return Array.from(map.values())
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 8);
  }, [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Reports</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Quick rollups to help you audit performance
        </p>
      </div>

      {summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Sales"
            value={formatMoney(summary.total_sales)}
            icon={DollarSign}
          />
          <StatCard
            title="Total Orders"
            value={formatCount(summary.total_orders)}
            icon={Package}
          />
          <StatCard
            title="Active Providers"
            value={formatCount(summary.active_providers)}
            icon={ChefHat}
          />
          <StatCard
            title="Total Users"
            value={formatCount(summary.total_users)}
            icon={Users}
          />
        </div>
      ) : (
        <EmptyState
          title="No summary available"
          subtitle="Once data is available, reports will show here."
        />
      )}

      <div className="bg-white border border-[#FCEAE1] rounded-2xl p-5">
        <p className="text-sm font-semibold text-[#0F172A]">
          Top customers (by spend)
        </p>
        <p className="text-xs text-[#64748B]">
          Based on the recent orders list
        </p>
        {topCustomers.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#64748B]">
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Orders</th>
                  <th className="py-2">Spend</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((row) => (
                  <tr key={row.customer} className="border-t border-[#FCEAE1]">
                    <td className="py-3 pr-4 font-medium text-[#0F172A]">
                      {row.customer}
                    </td>
                    <td className="py-3 pr-4 text-[#0F172A]">
                      {formatCount(row.orders)}
                    </td>
                    <td className="py-3 font-semibold text-[#0F172A]">
                      {formatMoney(row.spend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No customer spend data yet"
              subtitle="Once orders exist, customer rollups will appear here."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-sm text-[#64748B] mt-1">Admin settings</p>
      </div>
      <EmptyState
        title="Settings coming soon"
        subtitle="This section is reserved for admin preferences and system configuration."
      />
    </div>
  );
}

function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const isLoggedIn = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    const savedToken =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem("mm_admin_token") ||
      localStorage.getItem("mm_token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/data", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load admin data");
        }

        const data = await res.json();
        setSummary(data.summary);
        setUsers(data.users || []);
        setProviders(data.providers || []);
        setOrders(data.orders || []);
        localStorage.setItem(STORAGE_KEY, token);
      } catch (err) {
        setError(err?.message || "Could not fetch admin data");
        setToken("");
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await admin.login({
        email: email.trim(),
        password: password.trim(),
      });
      if (!data?.token) throw new Error("Invalid response from admin login");
      setToken(data.token);
      localStorage.setItem(STORAGE_KEY, data.token);
      localStorage.setItem("mm_admin_token", data.token);
      // avoid conflicting regular user session while in admin mode
      localStorage.removeItem("mm_token");

      if (data.user) {
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setError(err?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setToken("");
    setSummary(null);
    setUsers([]);
    setProviders([]);
    setOrders([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("mm_admin_token");
    localStorage.removeItem("mm_token");
  }

  const searchParams = useSearchParams();
  const activeTab = searchParams?.get("tab") || "dashboard";

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF7ED] to-[#FCEAE1]">
        <div className="w-full max-w-md p-8 bg-white border border-[#FCEAE1] rounded-3xl shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#EA580C]">Mom's Magic</h2>
            <p className="text-sm text-[#64748B] mt-1">Admin Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#64748B] mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full border border-[#FCEAE1] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B] mb-1 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-[#FCEAE1] rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-[#EA580C] text-white rounded-xl font-semibold hover:bg-[#C2410C] transition-all disabled:opacity-70 shadow-sm"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </form>
          <p className="mt-4 text-xs text-center text-[#64748B]">
            Secure admin access only
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#EA580C] border-t-transparent"></div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            summary={summary}
            orders={orders}
            providers={providers}
            users={users}
          />
        );
      case "analytics":
        return (
          <AnalyticsView
            summary={summary}
            orders={orders}
            providers={providers}
          />
        );
      case "orders":
        return <OrdersView orders={orders} />;
      case "providers":
        return <ProvidersView providers={providers} />;
      case "users":
        return <UsersView users={users} />;
      case "reports":
        return <ReportsView summary={summary} orders={orders} />;
      case "settings":
        return <SettingsView />;
      default:
        return (
          <DashboardView
            summary={summary}
            orders={orders}
            providers={providers}
            users={users}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden">
      <AdminSidebar activeTab={activeTab} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{renderContent()}</div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#EA580C] border-t-transparent"></div>
        </div>
      }
    >
      <AdminDashboard />
    </Suspense>
  );
}
