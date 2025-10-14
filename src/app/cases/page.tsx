"use client";
import { useEffect, useState } from "react";

type CaseStudy = { id: string; title: string; summary: string; content?: string };

export default function CasesPage() {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [open, setOpen] = useState<CaseStudy | null>(null);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/case-studies", { cache: "no-store" });
      if (res.ok) setCases((await res.json()).cases);
      setLoadingData(false);
    })();
  }, []);
  return (
    <main className="min-h-screen text-white pt-24 px-6">
      <section className="max-w-6xl mx-auto space-y-6">
        <h1 className="heading-serif text-5xl font-light">Case studies</h1>
        <div className="grid md:grid-cols-2 gap-6">
          {loadingData && cases.length === 0 && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/10 p-5">
                  <div className="h-6 w-48 shimmer rounded" />
                  <div className="mt-3 h-16 shimmer rounded" />
                </div>
              ))}
            </>
          )}
          {cases.map((c) => (
            <button key={c.id} onClick={() => setOpen(c)} className="text-left rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-5 shadow-[0_0_18px_rgba(255,255,255,0.08)] hover:shadow-[0_0_28px_rgba(255,255,255,0.18)] transition transform hover:scale-[1.02] cursor-pointer">
              <h2 className="text-2xl font-semibold tracking-tight">{c.title}</h2>
              <p className="text-white/80 mt-2 leading-relaxed">{c.summary}</p>
            </button>
          ))}
        </div>

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(null)} />
            <div className="relative max-w-2xl w-full rounded-2xl border border-white/15 bg-black/90 p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-semibold">{open.title}</h3>
                <button onClick={() => setOpen(null)} className="pill-button px-4 py-1">Close</button>
              </div>
              <p className="text-white/80 mt-3">{open.summary}</p>
              {open.content && <div className="text-white/80 whitespace-pre-wrap mt-4">{open.content}</div>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}


