import { MapPin, UtensilsCrossed, Bike } from 'lucide-react'

const STEPS = [
  {
    icon: MapPin,
    title: 'Find a kitchen near you',
    description: 'Browse verified home cooks in your area. Filter by veg, non-veg, cuisine, and price.',
    color: 'bg-blue-50 text-[#2563EB]',
  },
  {
    icon: UtensilsCrossed,
    title: 'Choose your meal plan',
    description: 'Pick a daily or weekly plan. See the menu for each day and customise your order.',
    color: 'bg-orange-50 text-[#EA580C]',
  },
  {
    icon: Bike,
    title: 'Get it delivered fresh',
    description: 'Hot, home-cooked food delivered to your door at lunch or dinner time. Every single day.',
    color: 'bg-green-50 text-green-700',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8" aria-labelledby="how-it-works-heading">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 id="how-it-works-heading" className="font-heading font-bold text-3xl sm:text-4xl text-[#0F172A]">
            How it works
          </h2>
          <p className="mt-3 text-[#64748B] text-base max-w-md mx-auto">
            Get home-cooked food delivered in three simple steps.
          </p>
        </div>

        {/* Steps */}
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 relative" role="list">
          {/* Connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-[#FCEAE1] -z-0"
            aria-hidden="true"
          />

          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col items-center text-center relative">
              {/* Step number badge */}
              <div className="relative mb-5">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${step.color} relative z-10`}>
                  <step.icon size={32} aria-hidden="true" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#EA580C] text-white text-xs font-bold rounded-full flex items-center justify-center z-20">
                  {index + 1}
                </span>
              </div>

              <h3 className="font-heading font-bold text-xl text-[#0F172A] mb-2">
                {step.title}
              </h3>
              <p className="text-[#64748B] text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
