"use client";
import { useEffect, useState } from "react";

type Pkg = { id: string; title: string; priceCents: number; durationMin: number; description: string; features?: string[] };

export default function TreatmentsPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/packages");
      if (res.ok) setPackages((await res.json()).packages);
    })();
  }, []);
  return (
    <main className="min-h-screen text-white pt-24 px-6">
      <section className="max-w-6xl mx-auto space-y-6">
        <h1 className="heading-serif text-5xl font-light">Treatments</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((p, i) => (
            <div key={p.id} className={`${i % 2 === 0 ? "bg-gradient-to-br from-white/8 to-white/3" : "bg-black/60"} rounded-2xl border border-white/10 p-5 shadow-[0_0_18px_rgba(255,255,255,0.08)]`}>
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
              <form className="mt-4 flex flex-wrap gap-2" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
                const notes = (form.elements.namedItem("notes") as HTMLInputElement).value;
                const fd = new FormData();
                fd.append("name", name);
                fd.append("email", email);
                fd.append("phone", phone);
                fd.append("notes", notes);
                fd.append("packageId", p.id);
                const res = await fetch("/api/bookings", { method: "POST", body: fd });
                if (res.ok) {
                  window.location.href = "/booking/confirmed";
                } else {
                  alert("Failed to request booking.");
                }
              }}>
                <input name="name" placeholder="Your name" className="min-w-[140px] flex-1 bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <input name="email" type="email" placeholder="Email" className="min-w-[140px] flex-1 bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <input name="phone" placeholder="Phone" className="min-w-[140px] flex-1 bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <input name="notes" placeholder="Notes" className="basis-full md:basis-auto flex-[2] bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <button className="pill-button w-full justify-center">Book</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}


