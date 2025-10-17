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
    <main className="min-h-screen text-white pt-24 px-6 pb-12">
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="fade-in">
          <h1 className="heading-serif text-5xl md:text-6xl font-normal mb-2">Case studies</h1>
          <p className="text-white/60 text-sm tracking-tight">Real transformations and recovery journeys</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {loadingData && cases.length === 0 && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="matte-card p-6 fade-in" style={{ animationDelay: `${i*80}ms` }}>
                  <div className="h-6 w-48 shimmer rounded" />
                  <div className="mt-4 h-16 shimmer rounded" />
                </div>
              ))}
            </>
          )}
          {cases.map((c, i) => (
            <button key={c.id} onClick={() => setOpen(c)} className="text-left matte-card p-6 cursor-pointer fade-in" style={{ animationDelay: `${i*80}ms` }}>
              <h2 className="text-xl font-semibold tracking-tight leading-tight">{c.title}</h2>
              <p className="text-white/70 text-sm leading-relaxed mt-3">{c.summary}</p>
            </button>
          ))}
        </div>

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(null)} />
            <div className="relative max-w-2xl w-full rounded-3xl border border-white/12 bg-black/95 p-8 shadow-2xl fade-in">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="heading-serif text-3xl font-normal">{open.title}</h3>
                <button onClick={() => setOpen(null)} className="pill-button px-4 py-2 text-sm">Close</button>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{open.summary}</p>
              {open.content && <div className="text-white/65 text-sm leading-relaxed whitespace-pre-wrap mt-4">{open.content}</div>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}


