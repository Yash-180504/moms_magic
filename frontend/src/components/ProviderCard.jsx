import { Star, MapPin, Clock, ShieldCheck } from 'lucide-react'

const TAG_CONFIG = {
  veg: { label: 'Veg', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  nonveg: { label: 'Non-Veg', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
}

export default function ProviderCard({ provider }) {
  const { name, location, rating, totalOrders, priceFrom, tags, specialty, deliveryTime, thumbnail, verified } = provider

  return (
    <article className="bg-white rounded-2xl border border-[#FCEAE1] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group">

      {/* Thumbnail */}
      <div
        className="h-40 flex items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${thumbnail.from}, ${thumbnail.to})` }}
        role="img"
        aria-label={`${name} kitchen`}
      >
        <span className="text-white/30 font-heading font-bold text-5xl select-none uppercase tracking-widest">
          {name.charAt(0)}
        </span>
        {verified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#2563EB] text-xs font-semibold px-2 py-1 rounded-full">
            <ShieldCheck size={12} aria-hidden="true" />
            Verified
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
          <Star size={12} className="text-amber-500 fill-amber-500" aria-hidden="true" />
          <span className="text-xs font-semibold text-[#0F172A]">{rating}</span>
          <span className="text-xs text-[#64748B]">({totalOrders})</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Name + location */}
        <div>
          <h3 className="font-heading font-bold text-lg text-[#0F172A] group-hover:text-[#EA580C] transition-colors leading-tight">
            {name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={13} className="text-[#64748B] shrink-0" aria-hidden="true" />
            <span className="text-xs text-[#64748B]">{location}</span>
          </div>
        </div>

        {/* Specialty */}
        <p className="text-sm text-[#64748B] line-clamp-2 leading-relaxed">
          {specialty}
        </p>

        {/* Tags + delivery */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {tags.map(tag => {
              const config = TAG_CONFIG[tag]
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
                  {config.label}
                </span>
              )
            })}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <Clock size={12} aria-hidden="true" />
            {deliveryTime}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#FCEAE1]">
          <div>
            <span className="text-xs text-[#64748B]">From</span>
            <span className="text-lg font-bold text-[#EA580C] ml-1">₹{priceFrom}</span>
            <span className="text-xs text-[#64748B]">/meal</span>
          </div>
          <button
            className="bg-[#EA580C] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#C2410C] active:scale-95 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            aria-label={`Order from ${name}`}
          >
            Order Now
          </button>
        </div>
      </div>
    </article>
  )
}
