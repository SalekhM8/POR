"use client";
import { useEffect, useState } from "react";

type Pkg = { id: string; title: string; priceCents: number; durationMin: number; description: string; features?: string[]; tier?: string; category?: string };

export default function TrainingPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/packages", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPackages((data.packages as Pkg[]).filter(p => (p.category || "treatment") === "personal_training"));
      }
    })();
  }, []);
  const tierAccent = (tier?: string) => {
    const t = (tier || "").toLowerCase();
    if (t === 'platinum') return 'border-l-4 border-l-blue-300/40';
    if (t === 'gold') return 'border-l-4 border-l-yellow-300/40';
    if (t === 'silver') return 'border-l-4 border-l-gray-300/40';
    if (t === 'bronze') return 'border-l-4 border-l-orange-300/40';
    return '';
  };
  return (
    <main className="min-h-screen text-white pt-24 px-6 pb-12">
      <section className="max-w-7xl mx-auto space-y-8">
        <div className="fade-in">
          <h1 className="heading-serif text-5xl md:text-6xl font-normal mb-2">Personal Training</h1>
          <p className="text-white/60 text-sm tracking-tight">Tailored sessions to build strength and performance</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((p, i) => (
            <div key={p.id} className={`matte-card p-6 ${tierAccent(p.tier)} fade-in`} style={{ animationDelay: `${i*80}ms` }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-xl font-semibold tracking-tight leading-tight">{p.title}</h2>
                <div className="text-white/70 text-sm font-medium whitespace-nowrap">£{(p.priceCents/100).toFixed(2)}</div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{p.description}</p>
              {Array.isArray(p.features) && p.features.length>0 && (
                <ul className="mt-4 space-y-1.5 text-white/60 text-sm">
                  {p.features.map((f: string, i: number) => <li key={i} className="flex items-start gap-2"><span className="text-white/40 mt-0.5">•</span><span>{f}</span></li>)}
                </ul>
              )}
              <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-between">
                <span className="text-white/50 text-xs">{p.durationMin} minutes</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}



