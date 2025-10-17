"use client";
import { useEffect, useState } from "react";

type Pkg = { id: string; title: string; priceCents: number; durationMin: number; description: string; features?: string[]; tier?: string };

export default function TreatmentsPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activePkg, setActivePkg] = useState<Pkg | null>(null);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [slots, setSlots] = useState<Array<{ start: string; label: string }>>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/packages", { cache: "no-store" });
      if (res.ok) setPackages((await res.json()).packages);
      setLoadingData(false);
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
          <h1 className="heading-serif text-5xl md:text-6xl font-normal mb-2">Treatments</h1>
          <p className="text-white/60 text-sm tracking-tight">Book your session and elevate your recovery</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingData && packages.length === 0 && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="matte-card p-6 fade-in" style={{ animationDelay: `${i*80}ms` }}>
                  <div className="h-6 w-40 shimmer rounded" />
                  <div className="mt-4 h-20 shimmer rounded" />
                  <div className="mt-4 h-10 shimmer rounded" />
                </div>
              ))}
            </>
          )}
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
                <button className="pill-button px-5 py-2 text-sm" onClick={()=>{ setActivePkg(p); setWizardOpen(true); setStep(0); setSelectedDate(new Date().toISOString().slice(0,10)); setSelectedSlot(""); setSlots([]); setForm({ name: "", email: "", phone: "", notes: "" }); }}>Book now</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {wizardOpen && activePkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/70" onClick={()=>setWizardOpen(false)} />
          <div className="relative max-w-2xl w-full rounded-3xl border border-white/12 bg-black/95 p-8 shadow-2xl fade-in">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="heading-serif text-3xl font-normal mb-1">{activePkg.title}</h3>
                <p className="text-white/50 text-sm">Step {step + 1} of 3</p>
              </div>
              <button className="pill-button px-4 py-2 text-sm" onClick={()=>setWizardOpen(false)}>Close</button>
            </div>
            <div className="mb-2 flex gap-2">
              {[0,1,2].map((i)=> (
                <span key={i} className={`h-1 rounded-full transition-all ${i <= step ? 'bg-white' : 'bg-white/20'}`} style={{ width: `${100 / 3}%` }} />
              ))}
            </div>
            <div className="mt-6">
              {step === 0 && (
                <div className="grid gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Your name</label>
                    <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} placeholder="John Smith" className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Email</label>
                    <input type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} placeholder="john@example.com" className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Phone (optional)</label>
                    <input value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} placeholder="+44 7XXX XXXXXX" className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Notes (optional)</label>
                    <textarea value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} placeholder="Any specific areas of focus or concerns..." rows={3} className="input-field w-full resize-none" />
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="grid gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Select date</label>
                    <input type="date" value={selectedDate} onChange={async (e)=>{ setSelectedDate(e.target.value); setSelectedSlot(""); setSlots([]); }} className="input-field w-full" />
                  </div>
                  <button className="pill-button w-full justify-center" onClick={async ()=>{
                    setSlotsLoading(true);
                    setSelectedSlot("");
                    const res = await fetch(`/api/availability?date=${encodeURIComponent(selectedDate)}&packageId=${encodeURIComponent(activePkg.id)}`);
                    const j = res.ok ? await res.json() : { slots: [] };
                    const unique = Array.from(new Map(((j.slots||[]) as Array<{ start: string; label: string }>).map((s: { start: string; label: string })=>[s.start, s])).values()) as Array<{ start: string; label: string }>;
                    unique.sort((a, b) => (a.start as string).localeCompare(b.start as string));
                    setSlots(unique);
                    setSlotsLoading(false);
                  }}>Load available times</button>
                  {slotsLoading && <div className="text-white/60 text-sm text-center">Loading…</div>}
                  {slots.length>0 && (
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Choose a time</label>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((s, i)=> (
                          <button key={`${s.start}-${i}`} type="button" onClick={()=>setSelectedSlot(s.start)} className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${selectedSlot===s.start? 'bg-white/15 border-white/30 shadow-md' : 'bg-white/5 border-white/15 hover:bg-white/10'}`}>{s.label}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {!slotsLoading && slots.length===0 && selectedDate && <div className="text-white/60 text-sm text-center p-4 rounded-xl bg-white/5">No slots available for this date. Please try another day.</div>}
                </div>
              )}
              {step === 2 && (
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-white/60">Package</span><span className="font-medium">{activePkg.title}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-white/60">When</span><span className="font-medium">{new Date(selectedSlot).toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-white/60">Duration</span><span className="font-medium">{activePkg.durationMin} minutes</span></div>
                  <div className="flex justify-between text-sm"><span className="text-white/60">Price</span><span className="font-medium">£{(activePkg.priceCents/100).toFixed(2)}</span></div>
                </div>
              )}
            </div>
            <div className="mt-8 flex items-center justify-between gap-3">
              <button className="pill-button px-6 py-2" disabled={step===0} onClick={()=>setStep((s)=> (s===0?0:(s-1) as 0|1|2))}>Back</button>
              {step < 2 ? (
                <button className="pill-button px-6 py-2" onClick={()=>{
                  if (step===0) { if (!form.name || !form.email) { alert('Please fill required fields'); return; } setStep(1); return; }
                  if (step===1) { if (!selectedSlot) { alert('Choose a time'); return; } setStep(2); return; }
                }}>Next</button>
              ) : (
                <button className="pill-button px-6 py-2" disabled={submitting} onClick={async ()=>{
                  if (!activePkg || !selectedSlot) return;
                  setSubmitting(true);
                  const fd = new FormData();
                  fd.append('name', form.name);
                  fd.append('email', form.email);
                  fd.append('phone', form.phone);
                  fd.append('notes', form.notes);
                  fd.append('packageId', activePkg.id);
                  fd.append('start', selectedSlot);
                  const res = await fetch('/api/bookings', { method: 'POST', body: fd });
                  setSubmitting(false);
                  if (res.ok) { window.location.href = '/booking/confirmed'; }
                  else { const j = await res.json().catch(()=>({})); alert(j?.error || 'Failed to book'); }
                }}>{submitting? 'Booking…':'Confirm booking'}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


function SlotBookingForm({ pkgId, slots }: { pkgId: string; slots: Array<{ start: string; label: string }> }) {
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(false);
  return (
    <form className="grid gap-2" onSubmit={async (e)=>{
      e.preventDefault();
      if (!selected) { alert('Please choose a time'); return; }
      const form = e.currentTarget as HTMLFormElement;
      const name = (form.elements.namedItem('name') as HTMLInputElement).value;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value;
      const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
      const notes = (form.elements.namedItem('notes') as HTMLInputElement).value;
      setLoading(true);
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      fd.append('phone', phone);
      fd.append('notes', notes);
      fd.append('packageId', pkgId);
      fd.append('start', selected);
      const res = await fetch('/api/bookings', { method: 'POST', body: fd });
      setLoading(false);
      if (res.ok) {
        window.location.href = '/booking/confirmed';
      } else {
        const j = await res.json().catch(()=>({}));
        alert(j?.error || 'Failed to book');
      }
    }}>
      <div className="flex flex-wrap gap-2">
        {slots.map((s)=> (
          <button key={s.start} type="button" onClick={()=>setSelected(s.start)} className={`px-3 py-1.5 rounded-full border text-sm ${selected===s.start? 'bg-white/20 border-white/30' : 'bg-white/10 border-white/20 hover:bg-white/15'}`}>{s.label}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-2 mt-2">
        <input name="name" placeholder="Your name" className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
        <input name="email" type="email" placeholder="Email" className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
        <input name="phone" placeholder="Phone" className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
        <input name="notes" placeholder="Notes" className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60 md:col-span-2" />
      </div>
      <div className="mt-2">
        <button disabled={loading} className="pill-button w-full justify-center">{loading? 'Booking…':'Book selected time'}</button>
      </div>
    </form>
  );
}

