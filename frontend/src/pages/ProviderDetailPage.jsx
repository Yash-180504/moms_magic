import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPin, Star, Clock, ShieldCheck, ChefHat,
  Leaf, Drumstick, ShoppingCart, Plus, Minus, Trash2, AlertCircle, CheckCircle,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { providers as providersApi, menu as menuApi, orders as ordersApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function gradient(id = '') {
  const hues = [24, 142, 45, 0, 220, 280]
  const idx = (id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % hues.length
  return `hsl(${hues[idx]},75%,55%), hsl(${hues[idx] + 20},80%,40%)`
}

export default function ProviderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [provider, setProvider] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cart: { [menu_item_id]: quantity }
  const [cart, setCart] = useState({})
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [orderError, setOrderError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [pData, mData] = await Promise.all([
          providersApi.get(id),
          menuApi.list(id),
        ])
        setProvider(pData.provider)
        setMenuItems(mData.items)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  function addToCart(itemId) {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }))
  }
  function removeFromCart(itemId) {
    setCart(prev => {
      const next = { ...prev }
      if (next[itemId] > 1) next[itemId]--
      else delete next[itemId]
      return next
    })
  }
  function clearCart() { setCart({}) }

  const cartItems = Object.entries(cart)
    .map(([mid, qty]) => ({ item: menuItems.find(m => m.id === mid), qty }))
    .filter(e => e.item)

  const cartTotal = cartItems.reduce((s, { item, qty }) => s + item.price * qty, 0)

  async function placeOrder(e) {
    e.preventDefault()
    if (!user) return navigate('/login', { state: { from: `/provider/${id}` } })
    if (!address.trim()) { setOrderError('Please enter your delivery address.'); return }
    if (!cartItems.length) { setOrderError('Your cart is empty.'); return }

    setOrdering(true)
    setOrderError(null)
    try {
      const { order } = await ordersApi.create({
        provider_id: id,
        delivery_address: address,
        notes,
        items: cartItems.map(({ item, qty }) => ({ menu_item_id: item.id, quantity: qty })),
      })
      setOrderSuccess(order)
      clearCart()
    } catch (err) {
      setOrderError(err.message)
    } finally {
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 px-4">
          <AlertCircle size={40} className="text-red-500" />
          <p className="text-[#0F172A] font-semibold">{error || 'Provider not found'}</p>
          <button onClick={() => navigate('/')} className="text-[#EA580C] hover:underline cursor-pointer">← Back to kitchens</button>
        </div>
      </div>
    )
  }

  const vegItems    = menuItems.filter(m => m.is_veg)
  const nonvegItems = menuItems.filter(m => !m.is_veg)

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
      <Navbar />

      <main>
        {/* ── Header ── */}
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
                <h1 className="font-heading font-bold text-3xl sm:text-4xl">{provider.kitchen_name}</h1>
                <div className="flex items-center gap-3 mt-1 text-white/80 text-sm flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={13} />{provider.location}</span>
                  <span className="flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" />{Number(provider.rating).toFixed(1)} ({provider.total_orders} orders)</span>
                  {provider.delivery_time && <span className="flex items-center gap-1"><Clock size={13} />{provider.delivery_time}</span>}
                </div>
              </div>
              <span className="text-2xl font-bold shrink-0">₹{provider.price_from}<span className="text-base font-normal text-white/70">/meal</span></span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Menu ── */}
          <div className="lg:col-span-2 space-y-8">
            {provider.description && (
              <p className="text-[#64748B] leading-relaxed">{provider.description}</p>
            )}

            {menuItems.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#FCEAE1]">
                <ChefHat size={36} className="text-[#EA580C] mx-auto mb-3" />
                <p className="font-heading font-bold text-lg text-[#0F172A]">Menu coming soon</p>
                <p className="text-sm text-[#64748B] mt-1">This kitchen hasn't added their menu yet.</p>
              </div>
            )}

            {vegItems.length > 0 && (
              <MenuSection title="Veg Items" icon={<Leaf size={16} className="text-green-600" />} items={vegItems} cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
            )}
            {nonvegItems.length > 0 && (
              <MenuSection title="Non-Veg Items" icon={<Drumstick size={16} className="text-red-600" />} items={nonvegItems} cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
            )}
          </div>

          {/* ── Cart / Order form ── */}
          <aside className="lg:sticky lg:top-20 self-start">
            <div className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-5 py-4 flex items-center gap-2 text-white">
                <ShoppingCart size={20} />
                <span className="font-heading font-bold text-lg">Your Order</span>
                {cartItems.length > 0 && (
                  <button onClick={clearCart} className="ml-auto text-white/70 hover:text-white cursor-pointer">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Order success */}
              {orderSuccess ? (
                <div className="p-5 text-center space-y-3">
                  <CheckCircle size={40} className="text-green-500 mx-auto" />
                  <p className="font-heading font-bold text-lg text-[#0F172A]">Order placed!</p>
                  <p className="text-sm text-[#64748B]">Order #{orderSuccess.id.slice(0, 8)} — ₹{orderSuccess.total_amount}</p>
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full bg-[#EA580C] text-white font-semibold py-2.5 rounded-xl hover:bg-[#C2410C] transition-colors cursor-pointer"
                  >
                    View my orders
                  </button>
                </div>
              ) : (
                <form onSubmit={placeOrder} className="p-5 space-y-4">
                  {/* Cart items */}
                  {cartItems.length === 0 ? (
                    <p className="text-sm text-[#64748B] text-center py-4">Add items from the menu</p>
                  ) : (
                    <ul className="space-y-2">
                      {cartItems.map(({ item, qty }) => (
                        <li key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-[#0F172A] truncate mr-2">{item.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button type="button" onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-full bg-[#FDF4F0] text-[#EA580C] flex items-center justify-center cursor-pointer hover:bg-[#EA580C] hover:text-white transition-colors">
                              <Minus size={10} />
                            </button>
                            <span className="w-5 text-center font-semibold text-[#0F172A]">{qty}</span>
                            <button type="button" onClick={() => addToCart(item.id)} className="w-6 h-6 rounded-full bg-[#FDF4F0] text-[#EA580C] flex items-center justify-center cursor-pointer hover:bg-[#EA580C] hover:text-white transition-colors">
                              <Plus size={10} />
                            </button>
                            <span className="w-14 text-right text-[#64748B]">₹{item.price * qty}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {cartItems.length > 0 && (
                    <div className="flex justify-between font-bold text-[#0F172A] pt-2 border-t border-[#FCEAE1]">
                      <span>Total</span>
                      <span className="text-[#EA580C]">₹{cartTotal}</span>
                    </div>
                  )}

                  {/* Delivery address */}
                  <div>
                    <label htmlFor="delivery-address" className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Delivery Address <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="delivery-address"
                      rows={2}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Flat / building, street, city…"
                      className="w-full text-sm border border-[#FCEAE1] rounded-xl px-3 py-2 text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="order-notes" className="block text-xs font-semibold text-[#0F172A] mb-1">Notes (optional)</label>
                    <input
                      id="order-notes"
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Spice level, allergies…"
                      className="w-full text-sm border border-[#FCEAE1] rounded-xl px-3 py-2 text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all"
                    />
                  </div>

                  {orderError && (
                    <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
                      <AlertCircle size={13} /> {orderError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={ordering || cartItems.length === 0}
                    className="w-full bg-[#EA580C] text-white font-bold py-3 rounded-xl hover:bg-[#C2410C] active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ordering ? 'Placing order…' : user ? `Place Order — ₹${cartTotal}` : 'Log in to order'}
                  </button>
                </form>
              )}
            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  )
}

function MenuSection({ title, icon, items, cart, onAdd, onRemove }) {
  return (
    <div>
      <h2 className="font-heading font-bold text-xl text-[#0F172A] flex items-center gap-2 mb-4">
        {icon} {title}
      </h2>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className={`bg-white rounded-xl border border-[#FCEAE1] p-4 flex items-center gap-4 ${!item.is_available ? 'opacity-50' : ''}`}>
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#FDF4F0] flex items-center justify-center shrink-0">
                <ChefHat size={22} className="text-[#EA580C]" aria-hidden="true" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#0F172A] truncate">{item.name}</p>
                {!item.is_available && <span className="text-xs text-[#64748B] shrink-0">Unavailable</span>}
              </div>
              {item.description && <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">{item.description}</p>}
              {item.category && <span className="inline-block text-xs bg-[#FDF4F0] text-[#EA580C] px-2 py-0.5 rounded-full mt-1">{item.category}</span>}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="font-bold text-[#EA580C]">₹{item.price}</span>
              {item.is_available && (
                cart[item.id] ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => onRemove(item.id)} className="w-7 h-7 rounded-full bg-[#FDF4F0] text-[#EA580C] flex items-center justify-center cursor-pointer hover:bg-[#EA580C] hover:text-white transition-colors" aria-label="Remove one">
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center font-bold text-[#0F172A]">{cart[item.id]}</span>
                    <button onClick={() => onAdd(item.id)} className="w-7 h-7 rounded-full bg-[#EA580C] text-white flex items-center justify-center cursor-pointer hover:bg-[#C2410C] transition-colors" aria-label="Add one more">
                      <Plus size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onAdd(item.id)}
                    className="flex items-center gap-1 bg-[#EA580C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#C2410C] active:scale-95 transition-all cursor-pointer"
                    aria-label={`Add ${item.name} to cart`}
                  >
                    <Plus size={12} /> Add
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
