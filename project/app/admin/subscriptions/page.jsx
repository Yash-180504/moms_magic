"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Eye,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const STATUS_COLORS = {
  active: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  paused: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);

      const res = await fetch(`/api/admin/subscriptions?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/subscriptions/analytics");
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchSubscriptions();
      fetchAnalytics();
    }
  }, [user?.role, fetchSubscriptions, fetchAnalytics]);

  const updateStatus = async (subscriptionId, newStatus) => {
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, status: newStatus }),
      });

      if (res.ok) {
        fetchSubscriptions();
        setOpenMenuId(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const exportCSV = () => {
    const headers = [
      "ID",
      "Customer Name",
      "Email",
      "Phone",
      "Plan Type",
      "Amount",
      "Status",
      "Kitchen",
      "Created Date",
    ];
    const rows = subscriptions.map((sub) => [
      sub.id,
      sub.user_name,
      sub.user_email,
      sub.user_phone,
      sub.type,
      sub.amount,
      sub.status,
      sub.kitchen_name,
      new Date(sub.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (authLoading || !user || user.role !== "admin") {
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

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading font-bold text-3xl text-[#0F172A]">
                Subscription Management
              </h1>
              <p className="text-[#64748B] mt-1">
                Manage all customer subscriptions and view analytics
              </p>
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-[#EA580C] text-white font-semibold px-4 py-2 rounded-xl hover:bg-[#C2410C] transition-colors cursor-pointer"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-[#FCEAE1] p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B] font-medium">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold text-[#0F172A] mt-1">
                      ₹{Math.round(analytics.totalRevenue)}
                    </p>
                  </div>
                  <DollarSign
                    size={28}
                    className="text-[#EA580C] opacity-20"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#FCEAE1] p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B] font-medium">
                      Active Subscriptions
                    </p>
                    <p className="text-3xl font-bold text-[#0F172A] mt-1">
                      {analytics.activeSubscriptions}
                    </p>
                  </div>
                  <CheckCircle
                    size={28}
                    className="text-green-500 opacity-20"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#FCEAE1] p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B] font-medium">
                      Total Customers
                    </p>
                    <p className="text-3xl font-bold text-[#0F172A] mt-1">
                      {subscriptions.length}
                    </p>
                  </div>
                  <Users size={28} className="text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#FCEAE1] p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B] font-medium">
                      Avg. Order Value
                    </p>
                    <p className="text-3xl font-bold text-[#0F172A] mt-1">
                      ₹{subscriptions.length > 0 ? Math.round(subscriptions.reduce((sum, s) => sum + s.amount, 0) / subscriptions.length) : 0}
                    </p>
                  </div>
                  <TrendingUp
                    size={28}
                    className="text-purple-500 opacity-20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm p-4 mb-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#64748B]" />
              <span className="text-sm font-semibold text-[#0F172A]">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-sm border border-[#FCEAE1] rounded-xl px-3 py-1.5 text-[#0F172A] outline-none focus:border-[#EA580C]"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="text-sm border border-[#FCEAE1] rounded-xl px-3 py-1.5 text-[#0F172A] outline-none focus:border-[#EA580C]"
            >
              <option value="">All Types</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#64748B]">No subscriptions found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#FDF4F0] border-b border-[#FCEAE1]">
                        <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A]">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A]">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A]">
                          Kitchen
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-[#0F172A]">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-[#0F172A]">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[#0F172A]">
                          Started
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-[#0F172A]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FCEAE1]">
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-[#FDF4F0] transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-[#0F172A]">
                                {sub.user_name}
                              </p>
                              <p className="text-xs text-[#64748B]">
                                {sub.user_email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-[#0F172A] capitalize">
                              {sub.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-[#0F172A]">
                              {sub.kitchen_name || "—"}
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {sub.kitchen_location}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-[#0F172A]">
                              ₹{sub.amount}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                                STATUS_COLORS[sub.status]?.bg
                              } ${STATUS_COLORS[sub.status]?.text} ${
                                STATUS_COLORS[sub.status]?.border
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-[#64748B]">
                              {new Date(sub.created_at).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative inline-block">
                              <button
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId === sub.id ? null : sub.id
                                  )
                                }
                                className="p-1 text-[#64748B] hover:text-[#EA580C] transition-colors cursor-pointer"
                              >
                                <MoreVertical size={18} />
                              </button>

                              {openMenuId === sub.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setOpenMenuId(null)}
                                  />
                                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-[#FCEAE1] shadow-xl z-20 overflow-hidden">
                                    {sub.status !== "active" && (
                                      <button
                                        onClick={() =>
                                          updateStatus(sub.id, "active")
                                        }
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                                      >
                                        <Play size={14} /> Activate
                                      </button>
                                    )}
                                    {sub.status === "active" && (
                                      <button
                                        onClick={() =>
                                          updateStatus(sub.id, "paused")
                                        }
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                                      >
                                        <Pause size={14} /> Pause
                                      </button>
                                    )}
                                    <button
                                      onClick={() =>
                                        updateStatus(sub.id, "cancelled")
                                      }
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-[#FCEAE1]"
                                    >
                                      <Trash2 size={14} /> Cancel
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
