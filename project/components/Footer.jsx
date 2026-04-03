'use client'

import { useState } from 'react'
import { ChefHat, MessageCircle, X, Send } from 'lucide-react'

const LINKS = {
  Company: ['About us', 'Blog', 'Careers', 'Press'],
  Explore: ['Browse kitchens', 'How it works', 'Pricing', 'Cities'],
  'For Providers': ['List your kitchen', 'Provider dashboard', 'Become a partner', 'FAQs'],
  Legal: ['Privacy policy', 'Terms of service', 'Cookie policy'],
}

export default function Footer() {
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { from: 'bot', content: 'Hi! I am MomBot. Ask me about your orders, kitchens, location, or app features.' }
  ])

  function generateBotReply(userText) {
    const text = userText.trim().toLowerCase()
    if (!text) return 'Please type a message so I can help you.'
    if (text.includes('order')) return 'You can check your orders on the Orders page; ask me for details if you need help choosing a dish.'
    if (text.includes('veg')) return 'To filter veg meals, use the Veg Only category on the home page. I can also recommend popular vegetarian kitchens.'
    if (text.includes('non-veg')) return 'Non-veg options are available under Non-Veg. I can suggest top rated cooks near you.'
    if (text.includes('address') || text.includes('location')) return 'Use the Address Book in your profile menu to add or change delivery addresses quickly.'
    if (text.includes('profile')) return 'Your profile is under My Profile. You can update name, phone, and password there.'
    if (text.includes('help') || text.includes('assist')) return 'I can help you with login, search, orders, and address setup. What do you want to do first?'
    return 'Great question! I am still learning, but I think you probably want to see kitchens near you — check the home page filters and let me know what type of cuisine you prefer.'
  }

  async function sendChatMessage(e) {
    e.preventDefault()
    const trimmed = chatMessage.trim()
    if (!trimmed) return
    const userEntry = { from: 'user', content: trimmed }
    setChatHistory(prev => [...prev, userEntry])
    setChatMessage('')

    setTimeout(() => {
      const botReply = generateBotReply(trimmed)
      setChatHistory(prev => [...prev, { from: 'bot', content: botReply }])
    }, 350)
  }

  return (
    <>
      <footer className="bg-[#0F172A] text-white mt-auto relative" role="contentinfo">
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
            <div className="flex items-center gap-4">
              <p>Made with love in Kolkata</p>
              <button onClick={() => setChatOpen(true)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <MessageCircle size={16} />
                <span>AI Chat</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {chatOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setChatOpen(false)} />
          <div className="fixed bottom-4 right-4 w-80 bg-white rounded-2xl border border-[#FCEAE1] shadow-xl z-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#0F172A]">MomBot Chat</h3>
              <button onClick={() => setChatOpen(false)} className="text-[#64748B] hover:text-[#0F172A]">
                <X size={18} />
              </button>
            </div>
            <div className="h-56 overflow-auto space-y-2 mb-3">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`rounded-lg p-2 text-xs ${msg.from === 'bot' ? 'bg-[#F0F4FF] text-[#1E3A8A]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>
                  <strong>{msg.from === 'bot' ? 'MomBot' : 'You'}:</strong> {msg.content}
                </div>
              ))}
            </div>
            <form onSubmit={sendChatMessage} className="flex gap-2">
              <input value={chatMessage} onChange={e => setChatMessage(e.target.value)}
                className="flex-1 px-2 py-1 border border-[#FCEAE1] rounded-lg text-xs" placeholder="Ask me something..." />
              <button type="submit" className="px-2 py-1 bg-[#EA580C] text-white rounded-lg text-xs">Send</button>
            </form>
          </div>
        </>
      )}
    </>
  )
}
