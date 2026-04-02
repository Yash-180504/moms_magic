'use client'

import { useState, useEffect, useCallback } from 'react'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { OrderCard } from '@/app/dashboard/page'
import { orders as ordersApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orderList, setOrderList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = useCallback(() => {
    ordersApi.list()
      .then(data => setOrderList(data.orders || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login'); return }
    fetchOrders()
  }, [authLoading, user, fetchOrders, router])
  useAutoRefresh(fetchOrders)

  async function cancelOrder(id) {
    try {
      const res = await ordersApi.updateStatus(id, 'cancelled')
      setOrderList(prev => prev.map(o => o.id === id ? { ...o, ...res.order } : o))
    } catch { /* noop */ }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F172A] mb-6">My Orders</h1>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!loading && orderList.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#FDF4F0] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} className="text-[#EA580C]" />
            </div>
            <p className="font-heading font-bold text-xl text-[#0F172A] mb-2">No orders yet</p>
            <p className="text-sm text-[#64748B] mb-4">Find a kitchen and place your first order.</p>
            <Link href="/" className="inline-block bg-[#EA580C] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#C2410C] transition-colors">
              Browse Kitchens
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {orderList.map(order => (
            <div key={order.id}>
              {order.kitchen_name && (
                <p className="text-xs text-[#64748B] font-semibold mb-1 ml-1">{order.kitchen_name}</p>
              )}
              <OrderCard
                order={order}
                onStatusChange={order.status === 'pending' ? cancelOrder : null}
                isProvider={false}
              />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
