'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChefHat, Plus, Pencil, Trash2, Save, X,
  Image, AlertCircle, CheckCircle, ShoppingBag, Loader2,
  Leaf, Drumstick, ToggleLeft, ToggleRight,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { providers as providersApi, menu as menuApi, orders as ordersApi, upload } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

const TABS = ['Kitchen', 'Menu', 'Orders']

function Field({ label, id, children, required }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[#0F172A] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
    </div>
  )
}
const inputCls = "w-full text-sm border border-[#FCEAE1] rounded-xl px-4 py-3 text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all"

export default function ProviderDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Kitchen')

  const [provider, setProvider] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [orderList, setOrderList] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState(null)

  const [kitchenForm, setKitchenForm] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const coverRef = useRef()

  const [menuModal, setMenuModal] = useState(null)
  const [menuForm, setMenuForm] = useState({})
  const [menuImgFile, setMenuImgFile] = useState(null)
  const menuImgRef = useRef()

  const load = useCallback(async () => {
    try {
      const [pData, oData] = await Promise.all([
        providersApi.myProfile().catch(() => null),
        ordersApi.list().catch(() => ({ orders: [] })),
      ])

      if (pData?.provider) {
        setProvider(pData.provider)
        setKitchenForm(p => p ?? pData.provider)
        const mData = await menuApi.list(pData.provider.id)
        setMenuItems(mData.items || [])
      } else {
        setKitchenForm(p => p ?? { kitchen_name: '', location: '', city: 'Kolkata', description: '', phone: '', delivery_time: '', price_from: 60, is_veg: false, is_nonveg: false })
      }

      setOrderList(oData.orders || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login'); return }
    if (user.role !== 'provider' && user.role !== 'admin') { router.replace('/'); return }
    load()
  }, [authLoading, user, load, router])
  useAutoRefresh(load)

  function showFlash(type, msg) {
    setFlash({ type, msg })
    setTimeout(() => setFlash(null), 4000)
  }

  async function saveKitchen(e) {
    e.preventDefault()
    setSaving(true)
    try {
      let imageData = {}
      if (coverFile) {
        const asset = await upload.file(coverFile, 'moms-magic/covers')
        imageData = { cover_image_url: asset.url, cover_image_id: asset.id }
      }
      const payload = { ...kitchenForm, ...imageData }
      let saved
      if (provider) {
        const res = await providersApi.update(provider.id, payload)
        saved = res.provider
      } else {
        const res = await providersApi.create(payload)
        saved = res.provider
      }
      setProvider(saved)
      setKitchenForm(saved)
      setCoverFile(null)
      showFlash('success', 'Kitchen profile saved!')
    } catch (err) {
      showFlash('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveMenuItem(e) {
    e.preventDefault()
    if (!provider) { showFlash('error', 'Save your kitchen profile first'); return }
    setSaving(true)
    try {
      let imageData = {}
      if (menuImgFile) {
        const asset = await upload.file(menuImgFile, 'moms-magic/menu')
        imageData = { image_url: asset.url, image_id: asset.id }
      }
      const payload = { ...menuForm, ...imageData }
      let saved
      if (menuModal.mode === 'add') {
        const res = await menuApi.add(provider.id, payload)
        saved = res.item
        setMenuItems(prev => [...prev, saved])
      } else {
        const res = await menuApi.update(menuModal.item.id, payload)
        saved = res.item
        setMenuItems(prev => prev.map(m => m.id === saved.id ? saved : m))
      }
      setMenuModal(null)
      setMenuForm({})
      setMenuImgFile(null)
      showFlash('success', `Menu item ${menuModal.mode === 'add' ? 'added' : 'updated'}!`)
    } catch (err) {
      showFlash('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteMenuItem(id) {
    if (!confirm('Delete this menu item?')) return
    try {
      await menuApi.delete(id)
      setMenuItems(prev => prev.filter(m => m.id !== id))
      showFlash('success', 'Menu item deleted')
    } catch (err) {
      showFlash('error', err.message)
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      const res = await ordersApi.updateStatus(orderId, status)
      setOrderList(prev => prev.map(o => o.id === orderId ? { ...o, ...res.order } : o))
    } catch (err) {
      showFlash('error', err.message)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#EA580C] rounded-2xl flex items-center justify-center">
            <ChefHat size={24} color="white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl text-[#0F172A]">Kitchen Dashboard</h1>
            <p className="text-sm text-[#64748B]">Welcome back, {user?.name}</p>
          </div>
          {provider && (
            <button
              onClick={() => router.push(`/provider/${provider.id}`)}
              className="ml-auto text-sm font-semibold text-[#EA580C] border border-[#EA580C] rounded-xl px-4 py-2 hover:bg-[#EA580C] hover:text-white transition-colors cursor-pointer"
            >
              View public page
            </button>
          )}
        </div>

        {flash && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-6 ${flash.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`} role="alert">
            {flash.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span className="text-sm">{flash.msg}</span>
          </div>
        )}

        <div className="flex gap-1 bg-white border border-[#FCEAE1] rounded-xl p-1 mb-6 w-fit" role="tablist">
          {TABS.map(tab => (
            <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === tab ? 'bg-[#EA580C] text-white' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
              {tab}
              {tab === 'Orders' && orderList.filter(o => o.status === 'pending').length > 0 && (
                <span className="ml-2 bg-white text-[#EA580C] text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {orderList.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Kitchen Tab */}
        {activeTab === 'Kitchen' && kitchenForm && (
          <form onSubmit={saveKitchen} className="bg-white rounded-2xl border border-[#FCEAE1] p-6 space-y-5">
            <h2 className="font-heading font-bold text-xl text-[#0F172A] mb-4">{provider ? 'Edit Kitchen Profile' : 'Set Up Your Kitchen'}</h2>

            <div>
              <p className="text-sm font-semibold text-[#0F172A] mb-2">Cover Image</p>
              <div
                onClick={() => coverRef.current?.click()}
                className="h-40 rounded-xl border-2 border-dashed border-[#FCEAE1] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#EA580C] transition-colors relative overflow-hidden"
                style={kitchenForm.cover_image_url ? { backgroundImage: `url(${kitchenForm.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                role="button" aria-label="Upload cover image"
              >
                {!kitchenForm.cover_image_url && (
                  <>
                    <Image size={28} className="text-[#64748B]" />
                    <span className="text-sm text-[#64748B]">{coverFile ? coverFile.name : 'Click to upload cover image'}</span>
                  </>
                )}
                {kitchenForm.cover_image_url && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-semibold">Change image</span>
                  </div>
                )}
              </div>
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => setCoverFile(e.target.files[0])} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Kitchen Name" id="kname" required>
                <input id="kname" type="text" required value={kitchenForm.kitchen_name} onChange={e => setKitchenForm(p => ({ ...p, kitchen_name: e.target.value }))} placeholder="Kamala's Kitchen" className={inputCls} />
              </Field>
              <Field label="Phone" id="kphone">
                <input id="kphone" type="tel" value={kitchenForm.phone || ''} onChange={e => setKitchenForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" className={inputCls} />
              </Field>
              <Field label="Location / Area" id="kloc" required>
                <input id="kloc" type="text" required value={kitchenForm.location} onChange={e => setKitchenForm(p => ({ ...p, location: e.target.value }))} placeholder="Salt Lake, Sector V" className={inputCls} />
              </Field>
              <Field label="City" id="kcity">
                <input id="kcity" type="text" value={kitchenForm.city} onChange={e => setKitchenForm(p => ({ ...p, city: e.target.value }))} placeholder="Kolkata" className={inputCls} />
              </Field>
              <Field label="Price From (₹)" id="kprice" required>
                <input id="kprice" type="number" min={20} required value={kitchenForm.price_from} onChange={e => setKitchenForm(p => ({ ...p, price_from: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Delivery Time" id="kdelivery">
                <input id="kdelivery" type="text" value={kitchenForm.delivery_time || ''} onChange={e => setKitchenForm(p => ({ ...p, delivery_time: e.target.value }))} placeholder="12pm & 7pm" className={inputCls} />
              </Field>
            </div>

            <Field label="Description" id="kdesc">
              <textarea id="kdesc" rows={3} value={kitchenForm.description || ''} onChange={e => setKitchenForm(p => ({ ...p, description: e.target.value }))} placeholder="Tell customers about your cooking…" className={`${inputCls} resize-none`} />
            </Field>

            <div className="flex gap-4 flex-wrap">
              {[
                { key: 'is_veg', label: 'Serves Veg', Icon: Leaf, on: 'text-green-600', ring: 'ring-green-200' },
                { key: 'is_nonveg', label: 'Serves Non-Veg', Icon: Drumstick, on: 'text-red-600', ring: 'ring-red-200' },
              ].map(({ key, label, Icon, on, ring }) => (
                <button key={key} type="button" onClick={() => setKitchenForm(p => ({ ...p, [key]: !p[key] }))}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${kitchenForm[key] ? `bg-white border-current ${on} ring-2 ${ring}` : 'border-[#FCEAE1] text-[#64748B]'}`}
                  aria-pressed={kitchenForm[key]}>
                  <Icon size={15} aria-hidden="true" />
                  {kitchenForm[key] ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {label}
                </button>
              ))}
            </div>

            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-[#EA580C] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#C2410C] transition-all cursor-pointer disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving…' : 'Save Kitchen'}
            </button>
          </form>
        )}

        {/* Menu Tab */}
        {activeTab === 'Menu' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-xl text-[#0F172A]">Menu Items ({menuItems.length})</h2>
              <button onClick={() => { setMenuForm({ is_veg: true, is_available: true }); setMenuModal({ mode: 'add' }) }}
                className="flex items-center gap-2 bg-[#EA580C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#C2410C] transition-all cursor-pointer">
                <Plus size={16} /> Add Item
              </button>
            </div>
            {!provider && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                Save your kitchen profile first before adding menu items.
              </div>
            )}
            {menuItems.length === 0 && provider && (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#FCEAE1]">
                <ChefHat size={36} className="text-[#EA580C] mx-auto mb-3" />
                <p className="font-heading font-bold text-lg text-[#0F172A]">No menu items yet</p>
                <p className="text-sm text-[#64748B] mt-1">Add dishes so customers can order from you.</p>
              </div>
            )}
            <div className="space-y-3">
              {menuItems.map(item => (
                <div key={item.id} className={`bg-white rounded-xl border border-[#FCEAE1] p-4 flex items-center gap-4 ${!item.is_available ? 'opacity-60' : ''}`}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#FDF4F0] flex items-center justify-center shrink-0">
                      <ChefHat size={18} className="text-[#EA580C]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#0F172A]">{item.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_veg ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {item.is_veg ? 'Veg' : 'Non-Veg'}
                      </span>
                      {!item.is_available && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Unavailable</span>}
                    </div>
                    {item.description && <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">{item.description}</p>}
                    {item.category && <span className="text-xs text-[#EA580C]">{item.category}</span>}
                  </div>
                  <span className="font-bold text-[#EA580C] shrink-0">₹{item.price}</span>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setMenuForm({ ...item }); setMenuModal({ mode: 'edit', item }) }}
                      className="p-2 text-[#64748B] hover:text-[#EA580C] hover:bg-[#FDF4F0] rounded-lg transition-colors cursor-pointer" aria-label={`Edit ${item.name}`}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => deleteMenuItem(item.id)}
                      className="p-2 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" aria-label={`Delete ${item.name}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'Orders' && (
          <div>
            <h2 className="font-heading font-bold text-xl text-[#0F172A] mb-4">Incoming Orders ({orderList.length})</h2>
            {orderList.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#FCEAE1]">
                <ShoppingBag size={36} className="text-[#EA580C] mx-auto mb-3" />
                <p className="font-heading font-bold text-lg text-[#0F172A]">No orders yet</p>
                <p className="text-sm text-[#64748B] mt-1">Orders will appear here as customers place them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderList.map(order => (
                  <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} isProvider />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Menu item modal */}
      {menuModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="menu-modal-title">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#FCEAE1]">
              <h2 id="menu-modal-title" className="font-heading font-bold text-lg text-[#0F172A]">
                {menuModal.mode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}
              </h2>
              <button onClick={() => { setMenuModal(null); setMenuForm({}); setMenuImgFile(null) }} className="text-[#64748B] hover:text-[#0F172A] cursor-pointer p-1">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={saveMenuItem} className="p-6 space-y-4">
              <div
                onClick={() => menuImgRef.current?.click()}
                className="h-32 rounded-xl border-2 border-dashed border-[#FCEAE1] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#EA580C] transition-colors relative overflow-hidden"
                style={menuForm.image_url ? { backgroundImage: `url(${menuForm.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                role="button" aria-label="Upload dish image"
              >
                {!menuForm.image_url && (
                  <>
                    <Image size={22} className="text-[#64748B]" />
                    <span className="text-xs text-[#64748B]">{menuImgFile ? menuImgFile.name : 'Click to add dish photo'}</span>
                  </>
                )}
                {menuForm.image_url && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-semibold">Change</span>
                  </div>
                )}
              </div>
              <input ref={menuImgRef} type="file" accept="image/*" className="hidden" onChange={e => setMenuImgFile(e.target.files[0])} />

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Dish Name" id="mname" required>
                    <input id="mname" type="text" required value={menuForm.name || ''} onChange={e => setMenuForm(p => ({ ...p, name: e.target.value }))} placeholder="Dal Makhani" className={inputCls} />
                  </Field>
                </div>
                <Field label="Price (₹)" id="mprice" required>
                  <input id="mprice" type="number" min={1} required value={menuForm.price || ''} onChange={e => setMenuForm(p => ({ ...p, price: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Category" id="mcat">
                  <input id="mcat" type="text" value={menuForm.category || ''} onChange={e => setMenuForm(p => ({ ...p, category: e.target.value }))} placeholder="Main Course" className={inputCls} />
                </Field>
                <div className="col-span-2">
                  <Field label="Description" id="mdesc">
                    <textarea id="mdesc" rows={2} value={menuForm.description || ''} onChange={e => setMenuForm(p => ({ ...p, description: e.target.value }))} placeholder="Slow-cooked lentils with cream…" className={`${inputCls} resize-none`} />
                  </Field>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                {[
                  { key: 'is_veg', label: 'Veg', active: menuForm.is_veg },
                  { key: 'is_available', label: 'Available', active: menuForm.is_available !== false },
                ].map(({ key, label, active }) => (
                  <button key={key} type="button" onClick={() => setMenuForm(p => ({ ...p, [key]: !p[key] }))}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${active ? 'bg-[#EA580C] text-white border-[#EA580C]' : 'border-[#FCEAE1] text-[#64748B]'}`}
                    aria-pressed={active}>
                    {active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />} {label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setMenuModal(null); setMenuForm({}); setMenuImgFile(null) }}
                  className="flex-1 border border-[#FCEAE1] text-[#64748B] font-semibold py-2.5 rounded-xl hover:bg-[#FDF4F0] transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-[#EA580C] text-white font-bold py-2.5 rounded-xl hover:bg-[#C2410C] transition-all cursor-pointer disabled:opacity-60">
                  {saving ? 'Saving…' : menuModal.mode === 'add' ? 'Add Item' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export function OrderCard({ order, onStatusChange, isProvider = false }) {
  const STATUS_COLORS = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    preparing: 'bg-orange-50 text-orange-700 border-orange-200',
    out_for_delivery: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  }

  const NEXT_STATUS = {
    pending: 'confirmed',
    confirmed: 'preparing',
    preparing: 'out_for_delivery',
    out_for_delivery: 'delivered',
  }

  return (
    <div className="bg-white rounded-xl border border-[#FCEAE1] p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="font-semibold text-[#0F172A] text-sm">Order #{order.id.slice(0, 8)}</p>
          <p className="text-xs text-[#64748B]">{new Date(order.created_at).toLocaleString('en-IN')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
            {order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
          <span className="font-bold text-[#EA580C]">₹{order.total_amount}</span>
        </div>
      </div>
      <ul className="text-xs text-[#64748B] space-y-0.5">
        {(order.items || []).map((item, i) => (
          <li key={i}>{item.quantity}× {item.name} — ₹{item.price * item.quantity}</li>
        ))}
      </ul>
      <p className="text-xs text-[#64748B]">
        <span className="font-semibold text-[#0F172A]">Deliver to: </span>{order.delivery_address}
      </p>
      {isProvider && order.customer_name && (
        <p className="text-xs text-[#64748B]">
          <span className="font-semibold text-[#0F172A]">Customer: </span>{order.customer_name}
          {order.customer_phone && ` · ${order.customer_phone}`}
        </p>
      )}
      {isProvider && NEXT_STATUS[order.status] && onStatusChange && (
        <button onClick={() => onStatusChange(order.id, NEXT_STATUS[order.status])}
          className="text-xs font-semibold bg-[#EA580C] text-white px-4 py-2 rounded-lg hover:bg-[#C2410C] transition-colors cursor-pointer">
          Mark as {NEXT_STATUS[order.status].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </button>
      )}
    </div>
  )
}
