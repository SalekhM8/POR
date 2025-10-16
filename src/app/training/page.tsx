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
  return (
    <main className="min-h-screen text-white pt-24 px-6">
      <section className="max-w-6xl mx-auto space-y-6">
        <h1 className="heading-serif text-5xl font-light">Personal Training</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((p) => (
            <div key={p.id} className={`rounded-2xl border border-white/10 p-5 ${p.tier === 'bronze' ? 'bg-[linear-gradient(135deg,#5a3b16,#3a250e)]' : p.tier === 'silver' ? 'bg-[linear-gradient(135deg,#464a4d,#2b2e31)]' : p.tier === 'gold' ? 'bg-[linear-gradient(135deg,#5c4a12,#3b300c)]' : p.tier === 'platinum' ? 'bg-[linear-gradient(135deg,#51586b,#303543)]' : 'bg-gradient-to-br from-white/8 to-white/3'}`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight">{p.title}</h2>
                <div className="text-white/85 text-sm font-medium">£{(p.priceCents/100).toFixed(2)} · {p.durationMin}m</div>
              </div>
              <p className="text-white/80 mt-2 leading-relaxed">{p.description}</p>
              {Array.isArray(p.features) && p.features.length>0 && (
                <ul className="mt-3 space-y-1 text-white/75">
                  {p.features.map((f: string, i: number) => <li key={i}>• {f}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}



