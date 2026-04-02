import Link from 'next/link'
import { Star, MapPin, Clock, ShieldCheck } from 'lucide-react'

const TAG_CONFIG = {
  veg: { label: 'Veg', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  nonveg: { label: 'Non-Veg', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
}

function gradient(id = '') {
  const hues = [24, 142, 45, 0, 220, 280]
  const idx = (id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % hues.length
  return `linear-gradient(135deg, hsl(${hues[idx]},75%,55%), hsl(${hues[idx] + 20},80%,40%))`
}

export default function ProviderCard({ provider }) {
  const { id, kitchen_name, location, rating, total_orders, price_from, is_veg, is_nonveg, description, delivery_time, cover_image_url, is_verified } = provider
  const tags = [...(is_veg ? ['veg'] : []), ...(is_nonveg ? ['nonveg'] : [])]
  const thumbUrl = cover_image_url || null

  return (
    <Link href={`/provider/${id}`}>
      <article className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group">
        <div className="h-28 sm:h-40 flex items-center justify-center relative overflow-hidden"
          style={thumbUrl ? { backgroundImage: `url(${thumbUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: gradient(id) }}
          role="img" aria-label={`${kitchen_name} kitchen`}>
          {!thumbUrl && <span className="text-white/30 font-heading font-bold text-5xl select-none uppercase tracking-widest">{kitchen_name.charAt(0)}</span>}
          {is_verified && (
            <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm text-[#2563EB] text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full">
              <ShieldCheck size={11} aria-hidden="true" />
              <span className="hidden sm:inline">Verified</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-1.5 py-0.5">
            <Star size={11} className="text-amber-500 fill-amber-500" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-[#0F172A]">{rating}</span>
            <span className="text-[11px] text-[#64748B] hidden sm:inline">({total_orders})</span>
          </div>
        </div>
        <div className="p-2.5 sm:p-4 flex flex-col gap-2 sm:gap-3 flex-1">
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-lg text-[#0F172A] group-hover:text-[#EA580C] transition-colors leading-tight line-clamp-2">{kitchen_name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-[#64748B] shrink-0" aria-hidden="true" />
              <span className="text-[11px] sm:text-xs text-[#64748B] truncate">{location}</span>
            </div>
          </div>
          {description && <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed hidden sm:block">{description}</p>}
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags.map(tag => { const c = TAG_CONFIG[tag]; return (
              <span key={tag} className={`inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} aria-hidden="true" />{c.label}
              </span>
            )})}
          </div>
          <div className="flex items-center justify-between mt-auto pt-2 sm:pt-3 border-t border-[#FCEAE1]">
            <div>
              <span className="text-[10px] sm:text-xs text-[#64748B]">From</span>
              <span className="text-sm sm:text-lg font-bold text-[#EA580C] ml-0.5">₹{price_from}</span>
            </div>
            <span className="bg-[#EA580C] text-white text-[10px] sm:text-sm font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl group-hover:bg-[#C2410C] transition-all">Order</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
