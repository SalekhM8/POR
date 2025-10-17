"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function VirtualConsultation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [recs, setRecs] = useState<Array<{ id: string; title: string; price: string; durationMin: number }>>([]);
  if (pathname.startsWith("/admin")) return null;

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
        <div className="fixed inset-0 z-[96] backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute right-4 bottom-24 md:right-6 md:bottom-28 w-[min(92vw,540px)] rounded-3xl border border-white/12 backdrop-blur-md bg-black/90 shadow-2xl fade-in">
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="heading-serif text-2xl font-normal">Virtual consultation</h3>
                <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="max-h-[48vh] overflow-auto space-y-3 pr-1 mb-4">
                {messages.map((m, i) => (
                  <div key={i} className={`max-w-[86%] text-sm leading-relaxed rounded-2xl px-4 py-2.5 fade-in ${m.role === "user" ? "ml-auto bg-white/12 text-white border border-white/10" : "mr-auto bg-white/5 text-white/85 border border-white/8"}`} style={{ animationDelay: `${i*60}ms` }}>
                    {m.content}
                  </div>
                ))}
                {loading && <div className="text-white/60 text-sm px-4">Thinking…</div>}
              </div>
              {recs.length > 0 && (
                <div className="mb-4 grid gap-2">
                  {recs.map((r) => (
                    <a key={r.id} href="/treatments" className="block matte-card p-4 hover:scale-[1.01] transition-all">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{r.title}</div>
                        <div className="text-white/70 text-xs">£{r.price} · {r.durationMin}m</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter' && !e.shiftKey){e.preventDefault();send();}}} placeholder="Describe what you're experiencing..." className="input-field flex-1" />
                <button onClick={send} disabled={loading} className="pill-button px-5 py-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


