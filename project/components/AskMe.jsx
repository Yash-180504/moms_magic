"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const DEFAULT_HISTORY = [
  {
    from: "bot",
    content:
      "Hi! I’m MomBot. Ask me about kitchens, orders, subscriptions, or how to use the app.",
  },
];

function generateReply(message) {
  const text = message.trim().toLowerCase();
  if (!text) return "Please type a message so I can help you.";
  if (text.includes("order"))
    return "You can view your orders on the Orders page. I can also help you choose a kitchen or check delivery status.";
  if (text.includes("subscription") || text.includes("plan"))
    return "Subscription plans can be added from the Plans page. I can help you pick the right plan based on your needs.";
  if (text.includes("kitchen") || text.includes("cook") || text.includes("meal"))
    return "Search kitchens from the home page, or use the filters to find veg / non-veg / nearby options.";
  if (text.includes("location") || text.includes("address"))
    return "Use the address search box on the home page or add saved delivery addresses from your profile.";
  if (text.includes("help") || text.includes("assist"))
    return "I can help with login, kitchen search, orders, subscriptions and checkout. What would you like to do?";
  return "Great question! I’m still learning, but I recommend checking the home page filters or ask me to suggest kitchens near your city.";
}

export default function AskMe() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState(DEFAULT_HISTORY);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    const userMessage = { from: "user", content: trimmed };
    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setTimeout(() => {
      setHistory((prev) => [
        ...prev,
        { from: "bot", content: generateReply(trimmed) },
      ]);
    }, 350);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div className="w-[320px] md:w-[360px] bg-white rounded-3xl border border-[#F1F5F9] shadow-2xl overflow-hidden mb-3">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#EA580C] text-white">
            <div>
              <p className="text-sm font-semibold">AskMe AI</p>
              <p className="text-[11px] text-white/90">Home cook assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-white/15 p-2 hover:bg-white/25 transition"
              aria-label="Close Ask me chat"
            >
              <X size={16} />
            </button>
          </div>
          <div className="h-72 overflow-y-auto px-4 py-3 space-y-2 bg-[#F8FAFC]">
            {history.map((entry, index) => (
              <div
                key={index}
                className={`rounded-2xl px-3 py-2 text-sm ${
                  entry.from === "bot"
                    ? "bg-white text-[#0F172A] self-start"
                    : "bg-[#FEF3C7] text-[#92400E] self-end"
                }`}
              >
                <span className="font-semibold">
                  {entry.from === "bot" ? "MomBot" : "You"}:
                </span>{" "}
                {entry.content}
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="px-3 py-3 bg-white border-t border-[#F1F5F9]">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 rounded-2xl border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/30"
                placeholder="Ask me about meals, orders or plans..."
              />
              <button
                type="submit"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EA580C] text-white hover:bg-[#C2410C] transition"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
      {mounted && (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-slate-900/10 hover:bg-[#059669] transition"
        >
          <MessageCircle size={18} />
          <span>{open ? "Close" : "Need help?"}</span>
        </button>
      )}
    </div>
  );
}
