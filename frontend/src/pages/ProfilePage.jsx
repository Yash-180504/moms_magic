import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, Mail, Phone, Pencil, Save, X, LogOut,
  ShoppingBag, LayoutDashboard, ChevronRight,
  CheckCircle, AlertCircle, Lock, Eye, EyeOff,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { auth as authApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  // Edit profile state
  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving]     = useState(false)
  const [flash, setFlash]       = useState(null)

  // Change password state
  const [pwOpen, setPwOpen]         = useState(false)
  const [pw, setPw]                 = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw]         = useState({})
  const [pwSaving, setPwSaving]     = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-16">
          <div className="w-16 h-16 bg-[#FDF4F0] rounded-2xl flex items-center justify-center">
            <User size={28} className="text-[#EA580C]" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-[#0F172A]">Sign in to see your profile</h2>
          <p className="text-sm text-[#64748B]">Create an account or log in to continue.</p>
          <div className="flex gap-3">
            <Link to="/login" className="bg-[#EA580C] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#C2410C] transition-colors text-sm">
              Log in
            </Link>
            <Link to="/register" className="border-2 border-[#EA580C] text-[#EA580C] font-semibold px-6 py-3 rounded-xl hover:bg-[#FFF7ED] transition-colors text-sm">
              Sign up
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  function showFlash(type, msg) {
    setFlash({ type, msg })
    setTimeout(() => setFlash(null), 3500)
  }

  async function saveProfile(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const { user: updated } = await authApi.updateMe({ name: form.name.trim(), phone: form.phone.trim() })
      updateUser(updated)
      setEditing(false)
      showFlash('success', 'Profile updated!')
    } catch (err) {
      showFlash('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  function cancelEdit() {
    setForm({ name: user.name, phone: user.phone || '' })
    setEditing(false)
  }

  async function changePassword(e) {
    e.preventDefault()
    if (pw.next !== pw.confirm) { showFlash('error', 'New passwords do not match'); return }
    if (pw.next.length < 6) { showFlash('error', 'Password must be at least 6 characters'); return }
    setPwSaving(true)
    try {
      await authApi.updateMe({ current_password: pw.current, new_password: pw.next })
      setPw({ current: '', next: '', confirm: '' })
      setPwOpen(false)
      showFlash('success', 'Password changed successfully!')
    } catch (err) {
      showFlash('error', err.message)
    } finally {
      setPwSaving(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7ED]">
      <Navbar />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 pb-6">

        {/* Flash */}
        {flash && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-5 text-sm ${
            flash.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`} role="alert">
            {flash.type === 'success'
              ? <CheckCircle size={16} className="shrink-0" />
              : <AlertCircle size={16} className="shrink-0" />}
            {flash.msg}
          </div>
        )}

        {/* Avatar + name header */}
        <div className="bg-white rounded-2xl border border-[#FCEAE1] p-6 mb-4 flex items-center gap-4">
          <div className="w-16 h-16 bg-[#EA580C] rounded-2xl flex items-center justify-center text-white font-heading font-bold text-2xl shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-xl text-[#0F172A] truncate">{user.name}</h1>
            <p className="text-sm text-[#64748B] truncate">{user.email}</p>
            <span className="inline-block mt-1 text-xs font-semibold text-[#EA580C] bg-[#FFF7ED] border border-[#FCEAE1] px-2.5 py-0.5 rounded-full capitalize">
              {user.role}
            </span>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-2 text-[#64748B] hover:text-[#EA580C] hover:bg-[#FDF4F0] rounded-xl transition-colors cursor-pointer"
              aria-label="Edit profile"
            >
              <Pencil size={18} />
            </button>
          )}
        </div>

        {/* Edit profile form */}
        {editing ? (
          <div className="bg-white rounded-2xl border border-[#FCEAE1] p-5 mb-4">
            <h2 className="font-heading font-bold text-lg text-[#0F172A] mb-4">Edit Profile</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <Field label="Full Name" id="name">
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full bg-[#FFF7ED] border border-[#FCEAE1] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all"
                />
              </Field>
              <Field label="Phone" id="phone">
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="Optional"
                  className="w-full bg-[#FFF7ED] border border-[#FCEAE1] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all"
                />
              </Field>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#EA580C] text-white font-semibold py-2.5 rounded-xl hover:bg-[#C2410C] active:scale-95 transition-all disabled:opacity-60 cursor-pointer text-sm"
                >
                  <Save size={15} />
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 flex items-center gap-1.5 border border-[#FCEAE1] text-[#64748B] font-semibold py-2.5 rounded-xl hover:bg-[#FDF4F0] transition-colors cursor-pointer text-sm"
                >
                  <X size={15} /> Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Info cards */
          <div className="bg-white rounded-2xl border border-[#FCEAE1] divide-y divide-[#FCEAE1] mb-4 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Mail size={16} className="text-[#64748B] shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wide">Email</p>
                <p className="text-sm text-[#0F172A] truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Phone size={16} className="text-[#64748B] shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wide">Phone</p>
                <p className="text-sm text-[#0F172A]">{user.phone || <span className="text-[#64748B] italic">Not set</span>}</p>
              </div>
            </div>
          </div>
        )}

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-[#FCEAE1] mb-4 overflow-hidden">
          <button
            onClick={() => setPwOpen(p => !p)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#FDF4F0] transition-colors cursor-pointer text-left"
          >
            <Lock size={16} className="text-[#64748B] shrink-0" />
            <span className="flex-1 text-sm font-semibold text-[#0F172A]">Change Password</span>
            <ChevronRight size={16} className={`text-[#64748B] transition-transform ${pwOpen ? 'rotate-90' : ''}`} />
          </button>

          {pwOpen && (
            <form onSubmit={changePassword} className="px-5 pb-5 space-y-3 border-t border-[#FCEAE1] pt-4">
              {[
                { key: 'current', label: 'Current Password' },
                { key: 'next',    label: 'New Password' },
                { key: 'confirm', label: 'Confirm New Password' },
              ].map(({ key, label }) => (
                <div key={key} className="relative">
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={showPw[key] ? 'text' : 'password'}
                      value={pw[key]}
                      onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                      required
                      className="w-full bg-[#FFF7ED] border border-[#FCEAE1] rounded-xl px-3 py-2.5 pr-10 text-sm text-[#0F172A] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] cursor-pointer"
                      aria-label={showPw[key] ? 'Hide' : 'Show'}
                    >
                      {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="submit"
                disabled={pwSaving}
                className="w-full bg-[#EA580C] text-white font-semibold py-2.5 rounded-xl hover:bg-[#C2410C] active:scale-95 transition-all disabled:opacity-60 cursor-pointer text-sm mt-1"
              >
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-[#FCEAE1] divide-y divide-[#FCEAE1] mb-4 overflow-hidden">
          {user.role === 'customer' && (
            <Link to="/orders" className="flex items-center gap-3 px-5 py-4 hover:bg-[#FDF4F0] transition-colors">
              <ShoppingBag size={16} className="text-[#EA580C] shrink-0" />
              <span className="flex-1 text-sm font-semibold text-[#0F172A]">My Orders</span>
              <ChevronRight size={16} className="text-[#64748B]" />
            </Link>
          )}
          {(user.role === 'provider' || user.role === 'admin') && (
            <Link to="/dashboard" className="flex items-center gap-3 px-5 py-4 hover:bg-[#FDF4F0] transition-colors">
              <LayoutDashboard size={16} className="text-[#EA580C] shrink-0" />
              <span className="flex-1 text-sm font-semibold text-[#0F172A]">My Dashboard</span>
              <ChevronRight size={16} className="text-[#64748B]" />
            </Link>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 font-semibold py-3 rounded-2xl hover:bg-red-50 active:scale-95 transition-all cursor-pointer text-sm"
        >
          <LogOut size={16} />
          Log out
        </button>

      </main>

      <Footer />
    </div>
  )
}
