import { Link } from 'react-router-dom'
import { Star, MapPin, Clock, ShieldCheck } from 'lucide-react'
import { imgUrl } from '../lib/api'

// Deterministic gradient from kitchen id
function gradient(id = '') {
  const hues = [24, 142, 45, 0, 220, 280]
  const idx = (id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % hues.length
  const h = hues[idx]
  return `hsl(${h},75%,55%), hsl(${h + 20},80%,40%)`
}

export default function ProviderCard({ provider }) {
  const {
    id, kitchen_name, location, rating, total_orders,
    price_from, is_veg, is_nonveg, description,
    delivery_time, cover_image_url, is_verified,
  } = provider

  const tags = [
    ...(is_veg ? ['veg'] : []),
    ...(is_nonveg ? ['nonveg'] : []),
  ]

  const thumbUrl = cover_image_url || null

  return (
    <Link
      to={`/provider/${id}`}
      className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
      aria-label={`View ${kitchen_name}`}
    >
      {/* Thumbnail */}
      <div
        className="h-40 flex items-center justify-center relative overflow-hidden"
        style={{
          background: thumbUrl
            ? `url(${thumbUrl}) center/cover`
            : `linear-gradient(135deg, ${gradient(id)})`,
        }}
        role="img"
        aria-label={`${kitchen_name} kitchen`}
      >
        {!thumbUrl && (
          <span className="text-white/30 font-heading font-bold text-5xl select-none uppercase tracking-widest">
            {kitchen_name?.charAt(0)}
          </span>
        )}

        {is_verified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#2563EB] text-xs font-semibold px-2 py-1 rounded-full">
            <ShieldCheck size={12} aria-hidden="true" />
            Verified
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
          <Star size={12} className="text-amber-500 fill-amber-500" aria-hidden="true" />
          <span className="text-xs font-semibold text-[#0F172A]">{Number(rating).toFixed(1)}</span>
          <span className="text-xs text-[#64748B]">({total_orders})</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-heading font-bold text-lg text-[#0F172A] group-hover:text-[#EA580C] transition-colors leading-tight">
            {kitchen_name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={13} className="text-[#64748B] shrink-0" aria-hidden="true" />
            <span className="text-xs text-[#64748B]">{location}</span>
          </div>
        </div>

        {description && (
          <p className="text-sm text-[#64748B] line-clamp-2 leading-relaxed">{description}</p>
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {tags.map(tag => {
              const config = tag === 'veg'
                ? { label: 'Veg',     bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' }
                : { label: 'Non-Veg', bg: 'bg-red-50',   text: 'text-red-700',   dot: 'bg-red-500'   }
              return (
                <span key={tag} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
                  {config.label}
                </span>
              )
            })}
          </div>
          {delivery_time && (
            <div className="flex items-center gap-1 text-xs text-[#64748B]">
              <Clock size={12} aria-hidden="true" />
              {delivery_time}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#FCEAE1]">
          <div>
            <span className="text-xs text-[#64748B]">From</span>
            <span className="text-lg font-bold text-[#EA580C] ml-1">₹{price_from}</span>
            <span className="text-xs text-[#64748B]">/meal</span>
          </div>
          <span className="bg-[#EA580C] text-white text-sm font-semibold px-4 py-2 rounded-xl group-hover:bg-[#C2410C] transition-colors">
            Order Now
          </span>
        </div>
      </div>
    </Link>
  )
}
