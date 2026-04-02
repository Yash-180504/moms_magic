import { ChefHat } from 'lucide-react'

const LINKS = {
  Company: ['About us', 'Blog', 'Careers', 'Press'],
  Explore: ['Browse kitchens', 'How it works', 'Pricing', 'Cities'],
  'For Providers': ['List your kitchen', 'Provider dashboard', 'Become a partner', 'FAQs'],
  Legal: ['Privacy policy', 'Terms of service', 'Cookie policy'],
}

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white mt-auto" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-[#EA580C] rounded-xl flex items-center justify-center">
                <ChefHat size={20} color="white" aria-hidden="true" />
              </div>
              <span className="font-heading font-bold text-lg">Mom&apos;s Magic</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">Connecting home cooks with people who crave a taste of home. Kolkata & beyond.</p>
          </div>
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm text-white mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Mom&apos;s Magic. All rights reserved.</p>
          <p>Made with love in Kolkata</p>
        </div>
      </div>
    </footer>
  )
}
