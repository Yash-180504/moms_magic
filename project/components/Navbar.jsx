'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ChefHat, ShoppingBag, LayoutDashboard, LogOut, MapPin, User, Settings, Plus, Home, Building, Hotel, Edit3, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import dynamic from 'next/dynamic'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const useMapEvents = dynamic(() => import('react-leaflet').then(mod => mod.useMapEvents), { ssr: false })

function MapEvents({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onLocationSelect([lat, lng])
    },
  })
  return null
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [addressBookOpen, setAddressBookOpen] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [addressForm, setAddressForm] = useState({ address1: '', address2: '', landmark: '', city: '', state: '', pincode: '', name: '', phone: '', type: 'home' })
  const [pincodeError, setPincodeError] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [addingAddress, setAddingAddress] = useState(false)
  const [mapCenter, setMapCenter] = useState([22.5726, 88.3639]) // Kolkata
  const [markerPosition, setMarkerPosition] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setAddresses([])
      setSelectedAddress(null)
      return
    }

    const all = JSON.parse(localStorage.getItem('mm_addresses') || '{}')
    const userAddresses = all[user.id] || []
    setAddresses(userAddresses)

    const selected = JSON.parse(localStorage.getItem('mm_selected_address') || 'null')
    if (selected?.userId === user.id && selected.address) {
      setSelectedAddress(selected.address)
    } else if (userAddresses[0]) {
      setSelectedAddress(userAddresses[0])
      localStorage.setItem('mm_selected_address', JSON.stringify({ userId: user.id, address: userAddresses[0] }))
    }
  }, [user])

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
    setAddressBookOpen(false)
    router.push('/')
  }

  function persistAddressBook(newAddresses) {
    if (!user) return
    const all = JSON.parse(localStorage.getItem('mm_addresses') || '{}')
    all[user.id] = newAddresses
    localStorage.setItem('mm_addresses', JSON.stringify(all))
    setAddresses(newAddresses)

    const selected = newAddresses.find(a => a.id === selectedAddress?.id) || newAddresses[0] || null
    if (selected) {
      setSelectedAddress(selected)
      localStorage.setItem('mm_selected_address', JSON.stringify({ userId: user.id, address: selected }))
    }
  }

  function selectAddress(id) {
    const found = addresses.find(a => a.id === id)
    if (!found) return
    setSelectedAddress(found)
    localStorage.setItem('mm_selected_address', JSON.stringify({ userId: user.id, address: found }))
    setAddressBookOpen(false)
  }

  function removeAddress(id) {
    const newList = addresses.filter(a => a.id !== id)
    persistAddressBook(newList)
    if (selectedAddress?.id === id) {
      const next = newList[0] || null
      setSelectedAddress(next)
      localStorage.setItem('mm_selected_address', JSON.stringify({ userId: user.id, address: next }))
    }
  }

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
      const data = await res.json()
      if (data && data.address) {
        const addr = data.address
        const address1 = [addr.house_number, addr.road, addr.suburb].filter(Boolean).join(', ') || data.display_name.split(',')[0]
        const city = addr.city || addr.town || addr.village || ''
        const state = addr.state || ''
        const pincode = addr.postcode || ''
        setAddressForm(prev => ({
          ...prev,
          address1,
          city,
          state,
          pincode
        }))
      }
    } catch (err) {
      console.error('Reverse geocode failed:', err)
    }
  }

  function getUserLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setMapCenter([latitude, longitude])
        setMarkerPosition([latitude, longitude])
        reverseGeocode(latitude, longitude)
        setLocationLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setLocationLoading(false)
        alert('Unable to get your location. Please allow location access.')
      }
    )
  }

  async function lookupPincode(pincode) {
    setPincodeError(null)
    if (!/^[0-9]{6}$/.test(pincode)) {
      setPincodeError('Pincode must be 6 digits')
      return
    }
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      const data = await res.json()
      if (data?.[0]?.Status !== 'Success') {
        setPincodeError('Invalid pincode')
        return
      }
      const postOffice = data[0].PostOffice?.[0]
      if (!postOffice) {
        setPincodeError('No location data found')
        return
      }
      setAddressForm(form => ({
        ...form,
        state: postOffice.State || '',
        city: postOffice.District || '',
      }))
    } catch (err) {
      setPincodeError('Could not resolve pincode')
    }
  }

  function addAddress(e) {
    e.preventDefault()
    const { address1, city, state, pincode, name, phone } = addressForm
    if (!address1.trim() || !city.trim() || !state.trim() || !pincode.trim() || !name.trim() || !phone.trim()) {
      setPincodeError('Please fill all required fields')
      return
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const newAddress = {
      id,
      address1: address1.trim(),
      address2: addressForm.address2.trim(),
      landmark: addressForm.landmark.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      name: name.trim(),
      phone: phone.trim(),
      type: addressForm.type === 'other' ? (addressForm.otherType || 'Other') : addressForm.type
    }

    const next = [...addresses, newAddress]
    persistAddressBook(next)
    setAddressForm({ address1: '', address2: '', landmark: '', city: '', state: '', pincode: '', name: '', phone: '', type: 'home' })
    setAddingAddress(false)
    setMarkerPosition(null)
  }

  function startAddingAddress() {
    setAddingAddress(true)
    getUserLocation()
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#FCEAE1] shadow-sm"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-14 md:h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Home">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-[#EA580C] rounded-xl flex items-center justify-center">
              <ChefHat size={18} color="white" aria-hidden="true" />
            </div>
            <span className="font-heading font-bold text-lg md:text-xl text-[#0F172A]">Mom&apos;s Magic</span>
          </Link>

          <div className="flex-1 flex items-center gap-2 bg-[#FFF7ED] border border-[#FCEAE1] rounded-xl px-3 py-2 focus-within:border-[#EA580C] focus-within:ring-2 focus-within:ring-[#EA580C]/20 transition-all">
            <Search size={15} className="text-[#64748B] shrink-0" aria-hidden="true" />
            <input type="search" placeholder="Search kitchens or meals…"
              className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none min-w-0"
              aria-label="Search kitchens or meals" />
          </div>

          <nav className="hidden md:flex items-center gap-2 shrink-0" aria-label="Account">
            {!user && (
              <Link href="/register?role=provider"
                className="text-sm font-medium text-[#64748B] hover:text-[#EA580C] transition-colors px-3 py-2 whitespace-nowrap">
                List your kitchen
              </Link>
            )}
            {user ? (
              <>




                <div className="relative">
                  <button onClick={() => setUserMenuOpen(p => !p)}
                    className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] bg-[#FDF4F0] border border-[#FCEAE1] rounded-xl px-3 py-2 hover:border-[#EA580C] transition-all cursor-pointer"
                    aria-expanded={userMenuOpen}>
                    <div className="w-6 h-6 bg-[#EA580C] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">{user.name.split(' ')[0]}</div>
                    </div>
                  </button>
                  {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-[#FCEAE1] shadow-xl z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#FCEAE1]">
                        <p className="text-sm font-bold text-[#0F172A] truncate">{user.name}</p>
                        <p className="text-xs text-[#64748B] truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-xs font-semibold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-full capitalize">{user.role}</span>
                      </div>
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#0F172A] hover:bg-[#FDF4F0] transition-colors">
                        <User size={15} className="text-[#64748B]" /> My Profile
                      </Link>
                      <Link href="/orders" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#0F172A] hover:bg-[#FDF4F0] transition-colors">
                        <ShoppingBag size={15} className="text-[#64748B]" /> My Orders
                      </Link>
                      <Link href="/settings" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#0F172A] hover:bg-[#FDF4F0] transition-colors">
                        <Settings size={15} className="text-[#64748B]" /> Settings
                      </Link>
                      {(user.role === 'provider' || user.role === 'admin') && (
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#0F172A] hover:bg-[#FDF4F0] transition-colors">
                          <LayoutDashboard size={15} className="text-[#64748B]" /> Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-[#FCEAE1] cursor-pointer">
                        <LogOut size={15} /> Log out
                      </button>
                    </div>
                  </>
                )}
              </div>

                <div className="relative">
                  <button onClick={() => { setAddressBookOpen(v => !v); setUserMenuOpen(false) }}
                    className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] bg-[#FDF4F0] border border-[#FCEAE1] rounded-xl px-3 py-2 hover:border-[#EA580C] transition-all cursor-pointer"
                    aria-expanded={addressBookOpen}>
                    <MapPin size={16} />
                    <span>Address Book</span>
                  </button>
                </div>
            </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-[#EA580C] border-2 border-[#EA580C] rounded-xl px-4 py-2 hover:bg-[#EA580C] hover:text-white transition-colors">Log in</Link>
                <Link href="/register" className="text-sm font-semibold bg-[#EA580C] text-white rounded-xl px-4 py-2 hover:bg-[#C2410C] transition-colors">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {addressBookOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setAddressBookOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl border border-[#FCEAE1] shadow-xl z-50 max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#0F172A]">Address Book</h3>
                <button onClick={() => setAddressBookOpen(false)} className="text-[#64748B] hover:text-[#0F172A]">
                  <X size={20} />
                </button>
              </div>

              {addingAddress ? (
                <div>
                  <h4 className="text-sm font-semibold text-[#0F172A] mb-3">Add New Address</h4>
                  <div className="mb-4 h-48 bg-gray-100 rounded-xl overflow-hidden">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <MapEvents onLocationSelect={(pos) => {
                        setMarkerPosition(pos)
                        reverseGeocode(pos[0], pos[1])
                      }} />
                      {markerPosition && (
                        <Marker
                          position={markerPosition}
                          draggable={true}
                          eventHandlers={{
                            dragend: (e) => {
                              const pos = e.target.getLatLng()
                              setMarkerPosition([pos.lat, pos.lng])
                              reverseGeocode(pos.lat, pos.lng)
                            },
                          }}
                        />
                      )}
                    </MapContainer>
                  </div>
                  <button onClick={getUserLocation} disabled={locationLoading} className="mb-4 w-full text-sm font-semibold text-[#EA580C] border border-[#EA580C] py-2 rounded-xl hover:bg-[#FFF7ED] transition-colors disabled:opacity-60">
                    {locationLoading ? 'Getting Location...' : 'Use My Location'}
                  </button>
                  <form onSubmit={addAddress} className="space-y-3">
                    <input value={addressForm.address1} onChange={e => setAddressForm(f => ({ ...f, address1: e.target.value }))}
                      placeholder="Address line 1" className="w-full px-3 py-2 border border-[#FCEAE1] rounded-xl text-sm" required />
                    <input value={addressForm.address2} onChange={e => setAddressForm(f => ({ ...f, address2: e.target.value }))}
                      placeholder="Address line 2 (optional)" className="w-full px-3 py-2 border border-[#FCEAE1] rounded-xl text-sm" />
                    <input value={addressForm.landmark} onChange={e => setAddressForm(f => ({ ...f, landmark: e.target.value }))}
                      placeholder="Landmark (optional)" className="w-full px-3 py-2 border border-[#FCEAE1] rounded-xl text-sm" />
                    <div className="grid grid-cols-2 gap-3">
                      <input value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))}
                        placeholder="City" className="px-3 py-2 border border-[#FCEAE1] rounded-xl text-sm" required />
                      <input value={addressForm.state} onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))}
                        placeholder="State" className="px-3 py-2 border border-[#FCEAE1] rounded-xl text-sm" required />
                    </div>
                    <input value={addressForm.pincode} onChange={e => setAddressForm(f => ({ ...f, pincode: e.target.value }))}
                      onBlur={e => lookupPincode(e.target.value)}
                      placeholder="Pincode" className="w-full px-3 py-2 border border-[#FCEAE1] rounded-xl text-sm" required />
                    {pincodeError && <p className="text-sm text-red-500">{pincodeError}</p>}
                    <div className="grid grid-cols-2 gap-3">
                      <input value={addressForm.name} onChange={e => setAddressForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Name" className="px-3 py-2 border border-[#FCEAE1] rounded-xl text-sm" required />
                      <input value={addressForm.phone} onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="Phone" className="px-3 py-2 border border-[#FCEAE1] rounded-xl text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#64748B] mb-2">Address Type</label>
                      <div className="flex gap-2">
                        {['home', 'hostel', 'hotel'].map(type => (
                          <button key={type} type="button" onClick={() => setAddressForm(f => ({ ...f, type }))}
                            className={`px-3 py-1 text-sm rounded-full border ${addressForm.type === type ? 'border-[#EA580C] text-[#EA580C]' : 'border-[#FCEAE1] text-[#64748B]'}`}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                        <button type="button" onClick={() => setAddressForm(f => ({ ...f, type: 'other' }))}
                          className={`px-3 py-1 text-sm rounded-full border ${addressForm.type === 'other' ? 'border-[#EA580C] text-[#EA580C]' : 'border-[#FCEAE1] text-[#64748B]'}`}>
                          Other
                        </button>
                      </div>
                      {addressForm.type === 'other' && (
                        <input value={addressForm.otherType || ''} onChange={e => setAddressForm(f => ({ ...f, otherType: e.target.value }))}
                          placeholder="Specify type" className="mt-2 w-full px-3 py-2 border border-[#FCEAE1] rounded-xl text-sm" />
                      )}
                    </div>
                    <div className="flex gap-3 pt-3">
                      <button type="submit" className="flex-1 bg-[#EA580C] text-white font-semibold py-2 rounded-xl hover:bg-[#C2410C] transition-colors">Save Address</button>
                      <button type="button" onClick={() => setAddingAddress(false)} className="px-4 border border-[#FCEAE1] text-[#64748B] font-semibold py-2 rounded-xl hover:bg-[#FDF4F0] transition-colors">Cancel</button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin size={48} className="mx-auto text-[#64748B] mb-4" />
                      <p className="text-[#64748B] mb-4">No addresses yet</p>
                      <button onClick={startAddingAddress} className="bg-[#EA580C] text-white font-semibold px-6 py-2 rounded-xl hover:bg-[#C2410C] transition-colors">
                        Add New Address
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button onClick={startAddingAddress} className="mb-4 w-full bg-[#EA580C] text-white font-semibold py-2 rounded-xl hover:bg-[#C2410C] transition-colors flex items-center justify-center gap-2">
                        <Plus size={16} /> Add New Address
                      </button>
                      <div className="space-y-3 max-h-64 overflow-auto">
                        {addresses.map(addr => (
                          <div key={addr.id} className="p-3 border border-[#FCEAE1] rounded-xl">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-[#0F172A]">{addr.address1}</p>
                                {addr.address2 && <p className="text-sm text-[#64748B]">{addr.address2}</p>}
                                {addr.landmark && <p className="text-sm text-[#64748B]">Landmark: {addr.landmark}</p>}
                                <p className="text-sm text-[#64748B]">{addr.city}, {addr.state} {addr.pincode}</p>
                                <p className="text-sm text-[#64748B]">{addr.name} • {addr.phone}</p>
                                <span className="inline-block mt-1 text-xs font-semibold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-full capitalize">
                                  {addr.type === 'other' ? (addr.otherType || 'Other') : addr.type}
                                </span>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <button onClick={() => selectAddress(addr.id)} className="text-xs text-[#EA580C] border border-[#EA580C] px-2 py-1 rounded">Select</button>
                                <button onClick={() => removeAddress(addr.id)} className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded">Delete</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}
