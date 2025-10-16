"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function VirtualConsultation() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [recs, setRecs] = useState<Array<{ id: string; title: string; price: string; durationMin: number }>>([]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      if (!res.ok) {
        let fallback = "I’m unavailable right now. Please try again shortly.";
        try {
          const err = await res.json();
          if (err?.error === "insufficient_quota") fallback = "The assistant has reached its current usage limit. Please try again later.";
        } catch {}
        setMessages((m) => [...m, { role: "assistant", content: fallback }]);
        return;
      }
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.message || "" }]);
      setRecs(data.recommendations || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Virtual consultation"
        className="fixed z-[95] group cursor-pointer"
        style={{
          position: "fixed",
          // place slightly above the admin shortcut (sits at ~bottom:16px). ~88px gives comfortable clearance
          bottom: `calc(env(safe-area-inset-bottom, 0px) + 76px)`,
          right: `calc(env(safe-area-inset-right, 0px) + 16px)`,
        }}
      >
        <div className="backdrop-blur bg-white/10 border border-white/15 rounded-full p-3 shadow-md transition group-hover:shadow-lg">
          {/* Stylized "i" with eye-shaped dot */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-white/90">
            {/* eye dot */}
            <path d="M12 5c2.2 0 3.8 1.6 4.6 3-.8 1.4-2.4 3-4.6 3s-3.8-1.6-4.6-3c.8-1.4 2.4-3 4.6-3z"/>
            <circle cx="12" cy="8" r="1.2" fill="currentColor" />
            {/* vertical stem */}
            <path d="M12 11v7" strokeLinecap="round"/>
          </svg>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[96]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-4 bottom-24 md:right-6 md:bottom-28 w-[min(92vw,560px)] rounded-3xl border border-white/15 backdrop-blur bg-black/60 shadow-[0_0_32px_rgba(255,255,255,0.12)]">
            <div className="p-4 md:p-5">
              <div className="text-white/90 heading-serif text-xl">Virtual consultation</div>
              <div className="mt-3 max-h-[46vh] overflow-auto space-y-2 pr-1">
                {messages.map((m, i) => (
                  <div key={i} className={`max-w-[88%] text-sm leading-relaxed rounded-2xl px-3 py-2 ${m.role === "user" ? "ml-auto bg-white/10 text-white" : "mr-auto bg-white/5 text-white/90"}`}>
                    {m.content}
                  </div>
                ))}
                {loading && <div className="text-white/70 text-sm">Thinking…</div>}
              </div>
              {recs.length > 0 && (
                <div className="mt-4 grid gap-2">
                  {recs.map((r) => (
                    <a key={r.id} href="/treatments" className="block rounded-xl border border-white/15 bg-white/5 p-3 hover:bg-white/10 transition">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{r.title}</div>
                        <div className="text-white/80 text-sm">£{r.price} · {r.durationMin}m</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();send();}}} placeholder="Tell me what you’re experiencing" className="flex-1 bg-transparent border border-white/30 rounded-xl px-3 py-2 text-white placeholder-white/60" />
                <button onClick={send} disabled={loading} className="pill-button px-5 py-2">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


