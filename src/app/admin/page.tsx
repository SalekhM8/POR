"use client";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
const adminSans = Inter({ subsets: ["latin"], variable: "--font-admin" });

type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  treatment?: string | null;
  source: string;
  createdAt: string;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [tab, setTab] = useState<"enquiries" | "packages" | "cases" | "about" | "bookings" | "timetable" | "ai">("enquiries");
  type AdminPackage = { id: string; title: string; slug: string; description: string; features?: string[]; priceCents: number; durationMin: number };
  type AdminCase = { id: string; title: string; slug: string; summary: string; content?: string; coverUrl?: string | null; tags?: string[] | null };
  type AdminAbout = { id: string; heading: string; content: string; heroUrl?: string | null } | null;
  type AdminBooking = { id: string; name: string; email: string; phone?: string | null; status: string; createdAt: string; startTime?: string | null; endTime?: string | null; package?: { title: string } };
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [about, setAbout] = useState<AdminAbout>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [openBooking, setOpenBooking] = useState<AdminBooking | null>(null);
  const [openEnquiry, setOpenEnquiry] = useState<Enquiry | null>(null);
  const [openBlock, setOpenBlock] = useState<{ type: 'recurring' | 'oneoff'; data: any } | null>(null);
  const [schedule, setSchedule] = useState<{ rules: Array<{ id: string; weekday: number; startMinutes: number; endMinutes: number; isActive: boolean }>; recurring: Array<{ id: string; weekday: number; startMinutes: number; endMinutes: number; startsOn: string; endsOn?: string | null; reason?: string | null }>; blocks: Array<{ id: string; start: string; end: string; reason?: string | null }> }>({ rules: [], recurring: [], blocks: [] });
  const [modal, setModal] = useState<null | { type: "rule" | "recurring" | "block"; data?: any }>(null);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const now = new Date();
    const weekday = (now.getUTCDay() + 6) % 7; // Monday = 0
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - weekday, 0, 0, 0, 0));
    return monday;
  });

  useEffect(() => {
    // Try to fetch to detect existing cookie and persist auth across reloads
    (async () => {
      const res = await fetch("/api/admin/enquiries");
      if (res.ok) setAuthed(true);
    })();
  }, []);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    const res = await fetch("/api/admin/login", { method: "POST", body: formData });
    setLoading(false);
    if (res.ok) {
      setAuthed(true);
    } else {
      alert("Invalid password");
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setEnquiries([]);
  }

  useEffect(() => {
    if (!authed) return;
    (async () => {
      const res = await fetch("/api/admin/enquiries");
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries);
      }
      const [pkgsRes, csRes, aboutRes, bookingsRes, scheduleRes] = await Promise.all([
        fetch("/api/admin/packages"),
        fetch("/api/admin/case-studies"),
        fetch("/api/admin/about"),
        fetch("/api/admin/bookings"),
        fetch("/api/admin/schedule"),
      ]);
      if (pkgsRes.ok) setPackages((await pkgsRes.json()).packages);
      if (csRes.ok) setCases((await csRes.json()).cases);
      if (aboutRes.ok) setAbout((await aboutRes.json()).about);
      if (bookingsRes.ok) setBookings((await bookingsRes.json()).bookings);
      if (scheduleRes.ok) {
        const sched = await scheduleRes.json();
        setSchedule(sched);
        if (typeof window !== 'undefined') {
          (window as any).__SCHEDULE_RULES__ = sched.rules;
        }
      }
    })();
  }, [authed]);

  async function reloadSchedule() {
    const res = await fetch("/api/admin/schedule");
    if (res.ok) setSchedule(await res.json());
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-black text-white pt-24 px-6">
        <section className="max-w-sm mx-auto">
          <h1 className="text-3xl mb-6">Admin sign in</h1>
          <form onSubmit={signIn} className="space-y-4">
            <input name="password" type="password" placeholder="Password" className="w-full bg-transparent border border-white/30 rounded-md px-4 py-3 placeholder-white/60 focus:outline-none" />
            <button disabled={loading} className="pill-button w-full justify-center">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className={`${adminSans.variable} min-h-screen bg-black text-white pt-8 md:pt-12 px-4 md:px-6 pb-12`} style={{ fontFamily: "var(--font-admin), var(--font-body), ui-sans-serif, system-ui" }}>
      <section className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 fade-in">
          <h1 className="heading-serif text-4xl md:text-5xl font-normal">Dashboard</h1>
          <button onClick={signOut} className="pill-button px-6 py-2">Sign out</button>
        </div>

        <div className="md:flex md:gap-6">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:flex w-60 shrink-0 flex-col gap-2">
            {([
              { key: "enquiries", label: "Enquiries", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5h16M4 12h16M4 19h10" strokeLinecap="round"/></svg>
              ) },
              { key: "packages", label: "Packages", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/></svg>
              ) },
              { key: "cases", label: "Case studies", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 8h10M7 12h6"/></svg>
              ) },
              { key: "about", label: "About", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="7" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>
              ) },
              { key: "bookings", label: "Bookings", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 7V3h8v4"/><rect x="4" y="7" width="16" height="14" rx="2"/><path d="M8 11h8"/></svg>
              ) },
              { key: "timetable", label: "Timetable", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>
              ) },
              { key: "ai", label: "AI", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5h9a6 6 0 0 1 0 12H9l-4 3v-3a6 6 0 0 1-1-4V5z"/><path d="M13.5 7.5a3.5 3.5 0 1 0 0 7"/></svg>
              ) },
            ] as const).map((item) => (
              <button key={item.key} onClick={() => setTab(item.key)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${tab===item.key ? "matte-card" : "bg-transparent hover:bg-white/5"}`}>
                <span className="opacity-80">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </aside>

          {/* Main content */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="matte-card p-5 fade-in">
                <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Enquiries</div>
                <div className="text-3xl font-semibold">{enquiries.length}</div>
              </div>
              <div className="matte-card p-5 fade-in" style={{ animationDelay: '80ms' }}>
                <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Packages</div>
                <div className="text-3xl font-semibold">{packages.length}</div>
              </div>
              <div className="matte-card p-5 fade-in" style={{ animationDelay: '160ms' }}>
                <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Case studies</div>
                <div className="text-3xl font-semibold">{cases.length}</div>
              </div>
              <div className="matte-card p-5 fade-in" style={{ animationDelay: '240ms' }}>
                <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Bookings</div>
                <div className="text-3xl font-semibold">{bookings.length}</div>
              </div>
            </div>

            {/* Mobile nav pills */}
            <nav className="md:hidden mb-6 backdrop-blur bg-white/10 border border-white/15 rounded-full shadow-md px-2 py-1 w-full overflow-x-auto no-scrollbar">
              {(["enquiries","packages","cases","about","bookings","timetable"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-sm mr-1 md:mr-2 ${tab===t?"bg-white/20":"opacity-80 hover:opacity-100"}`}>{t}</button>
              ))}
            </nav>

        {tab === "enquiries" && (
        <div className="grid gap-4">
          {enquiries.map((e, i) => (
              <button key={e.id} onClick={() => setOpenEnquiry(e)} className="text-left matte-card p-5 fade-in" style={{ animationDelay: `${i*60}ms` }}>
              <div className="flex flex-wrap justify-between gap-2 text-white/60 text-xs uppercase tracking-wider mb-2">
                <span>{new Date(e.createdAt).toLocaleString()}</span>
                <span>{e.source}</span>
              </div>
              <div className="font-semibold text-white/90">{e.name} — {e.email}{e.phone ? ` — ${e.phone}` : ""}</div>
              <div className="text-white/70 text-sm mt-2 leading-relaxed">{e.message}</div>
              </button>
            ))}
          </div>
        )}

        {openEnquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="absolute inset-0 bg-black/70" onClick={() => setOpenEnquiry(null)} />
            <div className="relative max-w-2xl w-full rounded-3xl border border-white/12 bg-black/95 p-8 shadow-2xl fade-in">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="heading-serif text-3xl font-normal">{openEnquiry.name}</h3>
                <button onClick={() => setOpenEnquiry(null)} className="pill-button px-4 py-2 text-sm">Close</button>
              </div>
              <div className="text-white/70 text-sm mb-4">{openEnquiry.email}{openEnquiry.phone ? ` — ${openEnquiry.phone}` : ""}</div>
              <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{openEnquiry.message}</div>
              {/** Render JSON answers if present */}
              { (openEnquiry as unknown as { answers?: Record<string, unknown> }).answers && (
                <div className="mt-6 grid gap-3 text-sm">
                  {Object.entries(((openEnquiry as unknown as { answers?: Record<string, unknown> }).answers) as Record<string, unknown>).map(([k,v]) => (
                    <div key={k} className="flex gap-3 pb-2 border-b border-white/8"><span className="text-white/50 min-w-36 capitalize text-xs">{k}:</span><span className="flex-1 text-white/80">{String(v)}</span></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "packages" && (
          <div className="grid gap-4">
            <div className="matte-card p-6">
              <h2 className="heading-serif text-2xl font-normal mb-4">Packages</h2>
              <form className="grid md:grid-cols-2 gap-3 mb-4" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const fd = new FormData(form);
                const raw = Object.fromEntries(fd.entries());
                const payload = {
                  title: String(raw.title || ''),
                  slug: String(raw.slug || ''),
                  description: String(raw.description || ''),
                  features: String(raw.features || '').split("\n").map(s => s.trim()).filter(Boolean),
                  priceCents: Math.round((raw.price ? Number(String(raw.price)) : 0) * 100),
                  durationMin: Number(raw.durationMin || 0),
                  imageUrl: raw.imageUrl ? String(raw.imageUrl) : undefined,
                  tier: raw.tier ? String(raw.tier) : undefined,
                  category: raw.category ? String(raw.category) : 'treatment',
                };
                const res = await fetch('/api/admin/packages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (res.ok) {
                  const data = await res.json();
                  setPackages((arr) => [data.package, ...arr]);
                  form.reset();
                } else {
                  alert('Failed to create package');
                }
              }}>
                <input name="title" placeholder="Title" className="input-field" />
                <input name="slug" placeholder="Slug" className="input-field" />
                <textarea name="description" placeholder="Description" className="md:col-span-2 input-field" rows={2} />
                <textarea name="features" placeholder="Features (one per line)" className="md:col-span-2 input-field" rows={3} />
                <input name="price" type="number" step="0.01" placeholder="Price (£)" className="input-field" />
                <input name="durationMin" type="number" placeholder="Duration (min)" className="input-field" />
                <select name="tier" className="input-field">
                  <option value="" className="text-black">Tier (optional)</option>
                  <option value="bronze" className="text-black">Bronze</option>
                  <option value="silver" className="text-black">Silver</option>
                  <option value="gold" className="text-black">Gold</option>
                  <option value="platinum" className="text-black">Platinum</option>
                </select>
                <select name="category" className="input-field">
                  <option value="treatment" className="text-black">Treatments</option>
                  <option value="personal_training" className="text-black">Personal Training</option>
                </select>
                <input name="imageUrl" placeholder="Image URL (optional)" className="input-field md:col-span-2" />
                <button className="pill-button md:col-span-2 justify-center">Add package</button>
              </form>
              <div className="grid md:grid-cols-2 gap-4">
                {packages.map((p) => (
                  <PackageCard key={p.id} pkg={p} onUpdated={(np) => setPackages((arr)=>arr.map(x=>x.id===np.id? { ...x, ...np } : x))} />
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "cases" && (
          <div className="grid gap-4">
            <div className="matte-card p-6">
              <h2 className="heading-serif text-2xl font-normal mb-4">Case studies</h2>
              <form className="grid md:grid-cols-2 gap-3 mb-4" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const fd = new FormData(form);
                const raw = Object.fromEntries(fd.entries());
                const payload = {
                  title: String(raw.title || ''),
                  slug: String(raw.slug || ''),
                  coverUrl: raw.coverUrl ? String(raw.coverUrl) : undefined,
                  tags: String(raw.tags || '').split(',').map(s=>s.trim()).filter(Boolean),
                  summary: String(raw.summary || ''),
                  content: String(raw.content || ''),
                };
                const res = await fetch('/api/admin/case-studies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (res.ok) {
                  const data = await res.json();
                  setCases((arr) => [data.caseStudy, ...arr]);
                  form.reset();
                } else {
                  alert('Failed to create case study');
                }
              }}>
                <input name="title" placeholder="Title" className="input-field" />
                <input name="slug" placeholder="Slug" className="input-field" />
                <input name="coverUrl" placeholder="Cover URL (optional)" className="input-field md:col-span-2" />
                <input name="tags" placeholder="Tags (comma-separated)" className="input-field md:col-span-2" />
                <textarea name="summary" placeholder="Summary" className="input-field md:col-span-2" rows={2} />
                <textarea name="content" placeholder="Content" className="input-field md:col-span-2" rows={4} />
                <button className="pill-button md:col-span-2 justify-center">Add case study</button>
              </form>
              <div className="grid md:grid-cols-2 gap-4">
                {cases.map((c) => (
                  <CaseCard key={c.id} data={c} onUpdated={(nc)=>setCases((arr)=>arr.map(x=>x.id===nc.id?nc:x))} />
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "about" && (
          <div className="grid gap-4">
            <div className="matte-card p-6">
              <h2 className="heading-serif text-2xl font-normal mb-4">About content</h2>
              <form className="grid gap-3 mb-4" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const fd = new FormData(form);
                const raw = Object.fromEntries(fd.entries());
                const payload = {
                  heading: String(raw.heading || ''),
                  heroUrl: raw.heroUrl ? String(raw.heroUrl) : undefined,
                  content: String(raw.content || ''),
                };
                const res = await fetch('/api/admin/about', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (res.ok) {
                  const data = await res.json();
                  setAbout(data.about);
                } else {
                  alert('Failed to save about');
                }
              }}>
                <input name="heading" placeholder="Heading" defaultValue={about?.heading || ''} className="input-field" />
                <input name="heroUrl" placeholder="Hero URL (optional)" defaultValue={about?.heroUrl || ''} className="input-field" />
                <textarea name="content" placeholder="Content" defaultValue={about?.content || ''} className="input-field" rows={8} />
                <button className="pill-button justify-center">Save</button>
              </form>
              {about ? (
                <div className="space-y-2">
                  <div className="text-lg font-semibold">{about.heading}</div>
                  <div className="text-white/80 whitespace-pre-wrap">{about.content}</div>
                </div>
              ) : (
                <div className="text-white/70">No content yet.</div>
              )}
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <div className="grid gap-4">
            {bookings.map((b, i) => (
              <div key={b.id} role="button" tabIndex={0} className="text-left matte-card p-5 focus:outline-none fade-in" style={{ animationDelay: `${i*60}ms` }} onClick={()=>setOpenBooking(b)} onKeyDown={(e)=>{ if (e.key==='Enter' || e.key===' ') { setOpenBooking(b); } }}>
                <div className="flex flex-wrap justify-between gap-2 text-white/80 text-sm">
                  <span>{new Date(b.createdAt).toLocaleString()}</span>
                  <span className="uppercase tracking-wide">{b.status}</span>
                </div>
                <div className="mt-2 font-semibold">{b.name} — {b.email}{b.phone ? ` — ${b.phone}` : ""}</div>
                <div className="text-white/80 mt-1">{b.package?.title ?? "Package"}</div>
                {b.startTime && (
                  <div className="text-white/70 text-sm mt-1">For: {new Date(b.startTime).toLocaleString()} {b.endTime ? `→ ${new Date(b.endTime).toLocaleTimeString()}` : ""}</div>
                )}
                <div className="mt-3 flex gap-2">
                  {["pending","confirmed","cancelled"].map((s) => (
                    <button key={s} onClick={async () => {
                      const res = await fetch('/api/admin/bookings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: b.id, status: s }) });
                      if (res.ok) {
                        const { booking } = await res.json();
                        setBookings((arr) => arr.map((x) => x.id===b.id? { ...x, status: booking.status } : x));
                      }
                    }} className={`px-3 py-1 rounded-full text-sm ${b.status===s? 'bg-white/20':'bg-white/10 hover:bg-white/20'}`} onMouseDown={(e)=>e.stopPropagation()}>{s}</button>
                  ))}
                </div>
            </div>
          ))}
        </div>
        )}

        {openBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="absolute inset-0 bg-black/70" onClick={()=>setOpenBooking(null)} />
            <div className="relative max-w-lg w-full rounded-3xl border border-white/12 bg-black/95 p-8 shadow-2xl fade-in">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h3 className="heading-serif text-3xl font-normal">Booking details</h3>
                <button onClick={()=>setOpenBooking(null)} className="pill-button px-4 py-2 text-sm">Close</button>
              </div>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">Client</span><span className="text-white/90">{openBooking.name}</span></div>
                <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">Email</span><span className="text-white/90">{openBooking.email}{openBooking.phone? ` — ${openBooking.phone}`: ''}</span></div>
                <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">Package</span><span className="text-white/90">{openBooking.package?.title ?? 'Package'}</span></div>
                {openBooking.startTime && <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">When</span><span className="text-white/90">{new Date(openBooking.startTime).toLocaleString()} {openBooking.endTime? `→ ${new Date(openBooking.endTime).toLocaleTimeString()}`: ''}</span></div>}
                <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">Status</span><span className="text-white/90 uppercase">{openBooking.status}</span></div>
                <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">Created</span><span className="text-white/90">{new Date(openBooking.createdAt).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        )}

        {openBlock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="absolute inset-0 bg-black/70" onClick={()=>setOpenBlock(null)} />
            <div className="relative max-w-lg w-full rounded-3xl border border-white/12 bg-black/95 p-8 shadow-2xl fade-in">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h3 className="heading-serif text-3xl font-normal">{openBlock.type === 'recurring' ? 'Recurring block' : 'One-off block'}</h3>
                <button onClick={()=>setOpenBlock(null)} className="pill-button px-4 py-2 text-sm">Close</button>
              </div>
              {openBlock.type === 'recurring' ? (
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">Weekday</span><span className="text-white/90">{weekdayLabel(openBlock.data.weekday)}</span></div>
                  <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">Time</span><span className="text-white/90">{mm(openBlock.data.startMinutes)} – {mm(openBlock.data.endMinutes)}</span></div>
                  {openBlock.data.reason && <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">Reason</span><span className="text-white/90">{openBlock.data.reason}</span></div>}
                  {openBlock.data.startsOn && <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">Starts</span><span className="text-white/90">{new Date(openBlock.data.startsOn).toLocaleDateString()}</span></div>}
                  {openBlock.data.endsOn && <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">Ends</span><span className="text-white/90">{new Date(openBlock.data.endsOn).toLocaleDateString()}</span></div>}
                </div>
              ) : (
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">Start</span><span className="text-white/90">{new Date(openBlock.data.start).toLocaleString()}</span></div>
                  <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">End</span><span className="text-white/90">{new Date(openBlock.data.end).toLocaleString()}</span></div>
                  {openBlock.data.reason && <div className="flex justify-between pb-2 border-b border-white/8"><span className="text-white/50">Reason</span><span className="text-white/90">{openBlock.data.reason}</span></div>}
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={()=>{setOpenBlock(null); setModal({ type: openBlock.type==='recurring'?'recurring':'block', data: openBlock.data });}} className="pill-button px-5 py-2">Edit</button>
                <button onClick={async()=>{
                  const action = openBlock.type === 'recurring' ? 'delete_recurring' : 'delete_block';
                  await fetch('/api/admin/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id: openBlock.data.id }) });
                  setOpenBlock(null);
                  reloadSchedule();
                }} className="pill-button px-5 py-2">Delete</button>
              </div>
            </div>
          </div>
        )}

        {tab === "ai" && (
          <div className="grid gap-4">
            <div className="matte-card p-6">
              <h2 className="heading-serif text-2xl font-normal mb-4">Virtual consultation</h2>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={async ()=>{
                  const res = await fetch('/api/ai/reindex', { method: 'POST' });
                  if (res.ok) { const j = await res.json(); alert(`Indexed ${j.chunks} chunks`); }
                  else alert('Reindex failed');
                }} className="pill-button px-5 py-2">Reindex content</button>
                <span className="text-white/70 text-sm">Rebuilds AI knowledge from Packages and Case studies.</span>
              </div>
            </div>
          </div>
        )}

        {tab === "timetable" && (
          <div className="grid gap-4">
            <div className="matte-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="heading-serif text-2xl font-normal">Timetable</h2>
                <div className="flex gap-2">
                  <button onClick={()=>setModal({ type: 'rule' })} className="pill-button px-4 py-2">Manage availability</button>
                  <button onClick={()=>setModal({ type: 'recurring' })} className="pill-button px-4 py-2">Add recurring block</button>
                  <button onClick={()=>setModal({ type: 'block' })} className="pill-button px-4 py-2">Add one-off block</button>
                </div>
              </div>
              <CalendarWeek
                weekStart={weekStart}
                onPrev={() => setWeekStart(new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate()-7, 0,0,0,0)))}
                onNext={() => setWeekStart(new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate()+7, 0,0,0,0)))}
                onToday={() => {
                  const now = new Date();
                  const wd = (now.getUTCDay()+6)%7;
                  setWeekStart(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()-wd, 0,0,0,0)));
                }}
                bookings={bookings}
                schedule={schedule}
                onOpenBooking={(b)=>setOpenBooking(b as any)}
                onOpenBlock={(type, data)=>setOpenBlock({ type, data })}
              />
              
            </div>

            {modal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                <div className="absolute inset-0 bg-black/70" onClick={()=>setModal(null)} />
                <div className={`relative ${modal.type==='rule' ? 'max-w-5xl' : 'max-w-lg'} w-full rounded-3xl border border-white/12 bg-black/95 p-8 shadow-2xl fade-in`}>
                  {modal.type === 'rule' && <ManageAvailabilityForm schedule={schedule} onClose={()=>{ setModal(null); reloadSchedule(); }} />}
                  {modal.type === 'recurring' && <RecurringForm initial={modal.data} onClose={()=>{ setModal(null); reloadSchedule(); }} />}
                  {modal.type === 'block' && <BlockForm onClose={()=>{ setModal(null); reloadSchedule(); }} />}
                </div>
              </div>
            )}
          </div>
        )}
            </div>
        </div>
      </section>
    </main>
  );
}

type PackageForEdit = { id: string; title: string; description: string; features?: string[]; priceCents: number; durationMin: number; imageUrl?: string; tier?: string };
function PackageCard({ pkg, onUpdated }: { pkg: PackageForEdit; onUpdated: (p: PackageForEdit)=>void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: pkg.title, description: pkg.description, features: (pkg.features||[]).join("\n"), price: (pkg.priceCents/100).toFixed(2), durationMin: String(pkg.durationMin), imageUrl: pkg.imageUrl || "", tier: pkg.tier || "" });
  async function save() {
    const payload = {
      title: form.title,
      description: form.description,
      features: form.features.split("\n").map(s=>s.trim()).filter(Boolean),
      priceCents: Math.round((form.price ? Number(form.price) : 0) * 100),
      durationMin: Number(form.durationMin||0),
      imageUrl: form.imageUrl || undefined,
      tier: form.tier || undefined,
    };
    const res = await fetch(`/api/admin/packages/${pkg.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { const data = await res.json(); onUpdated(data.package); setEditing(false); }
  }
  return (
    <div className="matte-card p-5">
      {!editing ? (
        <>
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold tracking-tight">{pkg.title}</div>
            <div className="text-white/80 text-sm font-medium">£{(pkg.priceCents/100).toFixed(2)} · {pkg.durationMin}m</div>
          </div>
          <div className="text-white/80 mt-2 leading-relaxed">{pkg.description}</div>
          {Array.isArray(pkg.features) && pkg.features.length>0 && (
            <ul className="mt-3 grid gap-1 text-white/75 list-disc list-inside">
              {pkg.features.map((f: string, i: number) => (<li key={i}>{f}</li>))}
            </ul>
          )}
          <div className="mt-4 flex justify-end">
            <button onClick={()=>setEditing(true)} className="pill-button px-5 py-2">Edit</button>
          </div>
        </>
      ) : (
        <div className="grid gap-4">
          <input value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} className="input-field" placeholder="Title" />
          <textarea value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} className="input-field" placeholder="Description" rows={2} />
          <textarea value={form.features} onChange={(e)=>setForm({...form, features: e.target.value})} className="input-field" placeholder="Features (one per line)" rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.price} onChange={(e)=>setForm({...form, price: e.target.value})} className="input-field" placeholder="Price (£)" type="number" step="0.01" />
            <input value={form.durationMin} onChange={(e)=>setForm({...form, durationMin: e.target.value})} className="input-field" placeholder="Duration (min)" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.tier} onChange={(e)=>setForm({...form, tier: e.target.value})} className="input-field">
              <option value="" className="text-black">Tier (optional)</option>
              <option value="bronze" className="text-black">Bronze</option>
              <option value="silver" className="text-black">Silver</option>
              <option value="gold" className="text-black">Gold</option>
              <option value="platinum" className="text-black">Platinum</option>
            </select>
            <input value={form.imageUrl} onChange={(e)=>setForm({...form, imageUrl: e.target.value})} className="input-field" placeholder="Image URL" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={()=>setEditing(false)} className="pill-button px-5 py-2">Cancel</button>
            <button onClick={save} className="pill-button px-5 py-2">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

function weekdayLabel(wd: number) {
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][wd] || String(wd);
}

function mm(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
}

function ManageAvailabilityForm({ schedule, onClose }: { schedule: { rules: Array<{ weekday: number; startMinutes: number; endMinutes: number }> }; onClose: () => void }) {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  type Block = { startMinutes: number; endMinutes: number };
  const [week, setWeek] = useState<Record<number, Block[]>>(()=>{
    const w: Record<number, Block[]> = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
    for (const r of schedule.rules) { (w[r.weekday] ||= []).push({ startMinutes: r.startMinutes, endMinutes: r.endMinutes }); }
    for (const k of Object.keys(w)) { w[Number(k)] = (w[Number(k)]||[]).sort((a,b)=>a.startMinutes-b.startMinutes); }
    return w;
  });
  function updateBlock(wd: number, idx: number, which: 'start'|'end', value: string) {
    const [hh,mm] = value.split(':').map(Number); const mins = hh*60+mm;
    setWeek((cur)=>{
      const arr = [...(cur[wd]||[])];
      const blk = arr[idx] || { startMinutes: 9*60, endMinutes: 17*60 };
      const next = { ...blk, [which==='start'?'startMinutes':'endMinutes']: mins } as Block;
      arr[idx] = next; return { ...cur, [wd]: arr };
    });
  }
  function addBlock(wd: number) { setWeek((cur)=>({ ...cur, [wd]: [...(cur[wd]||[]), { startMinutes: 9*60, endMinutes: 17*60 }] })); }
  function removeBlock(wd: number, idx: number) { setWeek((cur)=>({ ...cur, [wd]: (cur[wd]||[]).filter((_,i)=>i!==idx) })); }
  function toggleWorkDay(wd: number, on: boolean) { setWeek((cur)=>({ ...cur, [wd]: on ? (cur[wd]&&cur[wd].length>0?cur[wd]:[{ startMinutes: 9*60, endMinutes: 17*60 }]) : [] })); }
  function minsToHHMM(m: number){ const h=Math.floor(m/60); const mm=m%60; return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`; }
  async function save(){
    const weekly: Record<string, Block[]> = {};
    for (let wd=0; wd<7; wd++){ weekly[String(wd)] = week[wd]||[]; }
    await fetch('/api/admin/schedule', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'set_weekly', weekly }) });
    onClose();
  }
  return (
    <div className="grid gap-6 max-h-[75vh] overflow-auto">
      <h3 className="heading-serif text-3xl font-normal">Manage availability</h3>
      <p className="text-white/60 text-sm -mt-4">Set your weekly working hours. Toggle "Work day" on for days you want to accept bookings, then add one or more time ranges.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {days.map((label, wd)=> (
          <div key={wd} className="rounded-2xl border border-white/12 p-5 bg-white/5 min-w-[280px]">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">{label}</div>
              <label className="flex items-center gap-2 text-white/70 text-sm">
                <input type="checkbox" checked={(week[wd]||[]).length>0} onChange={(e)=>toggleWorkDay(wd, e.target.checked)} className="w-4 h-4" /> Work day
              </label>
            </div>
            {(week[wd]||[]).map((blk, idx)=> (
              <div key={idx} className="flex items-center gap-2 mb-3">
                <input
                  type="time"
                  value={minsToHHMM(blk.startMinutes)}
                  onChange={(e)=>updateBlock(wd, idx, 'start', e.target.value)}
                  className="input-field flex-1"
                />
                <span className="text-white/50">–</span>
                <input
                  type="time"
                  value={minsToHHMM(blk.endMinutes)}
                  onChange={(e)=>updateBlock(wd, idx, 'end', e.target.value)}
                  className="input-field flex-1"
                />
                <button type="button" className="pill-button px-3 py-1.5 text-xs" onClick={()=>removeBlock(wd, idx)}>×</button>
              </div>
            ))}
            {(week[wd]||[]).length>0 && (
              <button type="button" className="pill-button px-4 py-2 text-sm w-full justify-center" onClick={()=>addBlock(wd)}>+ Add range</button>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
        <button type="button" onClick={onClose} className="pill-button px-6 py-2">Cancel</button>
        <button onClick={save} className="pill-button px-6 py-2">Save</button>
      </div>
    </div>
  );
}

function RecurringForm({ initial, onClose }: { initial?: { id: string; weekday: number; startMinutes: number; endMinutes: number; startsOn?: string; endsOn?: string | null; reason?: string | null }; onClose: () => void }) {
  const [form, setForm] = useState({ weekday: initial?.weekday ?? 1, startMinutes: initial?.startMinutes ?? 12*60, endMinutes: initial?.endMinutes ?? 14*60, startsOn: (initial?.startsOn ? initial.startsOn.slice(0,10) : ''), endsOn: (initial?.endsOn ? (initial.endsOn as string).slice(0,10) : ''), reason: initial?.reason ?? '' });
  return (
    <form className="grid gap-4" onSubmit={async (e)=>{ e.preventDefault(); const action = initial? 'update_recurring':'create_recurring'; const body = { action, ...(initial? { id: initial.id } : {}), weekday: form.weekday, startMinutes: form.startMinutes, endMinutes: form.endMinutes, startsOn: form.startsOn? `${form.startsOn}T00:00:00.000Z` : undefined, endsOn: form.endsOn? `${form.endsOn}T00:00:00.000Z` : undefined, reason: form.reason || undefined }; await fetch('/api/admin/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); onClose(); }}>
      <h3 className="heading-serif text-3xl font-normal mb-2">{initial? 'Edit recurring block':'Add recurring block'}</h3>
      <div>
        <label className="block text-white/70 text-sm mb-2">Weekday</label>
        <select value={form.weekday} onChange={(e)=>setForm({...form, weekday: Number(e.target.value)})} className="input-field w-full">
          {Array.from({length:7}).map((_,i)=>(<option key={i} value={i} className="text-black">{weekdayLabel(i)}</option>))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-white/70 text-sm mb-2">Start</label>
          <input type="time" value={mm(form.startMinutes)} onChange={(e)=>{ const [hh,mmv] = e.target.value.split(':').map(Number); setForm({...form, startMinutes: hh*60+mmv}); }} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">End</label>
          <input type="time" value={mm(form.endMinutes)} onChange={(e)=>{ const [hh,mmv] = e.target.value.split(':').map(Number); setForm({...form, endMinutes: hh*60+mmv}); }} className="input-field w-full" />
        </div>
      </div>
      <div>
        <label className="block text-white/70 text-sm mb-2">Reason (optional)</label>
        <input type="text" value={form.reason} onChange={(e)=>setForm({...form, reason: e.target.value})} placeholder="e.g., Weekly lunch break" className="input-field w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-white/70 text-sm mb-2">Starts on</label>
          <input type="date" value={form.startsOn} onChange={(e)=>setForm({...form, startsOn: e.target.value})} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">Ends on (optional)</label>
          <input type="date" value={form.endsOn} onChange={(e)=>setForm({...form, endsOn: e.target.value})} className="input-field w-full" />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-2">
        <button type="button" onClick={onClose} className="pill-button px-5 py-2">Cancel</button>
        <button className="pill-button px-5 py-2">Save</button>
      </div>
    </form>
  );
}

function BlockForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ start: '', end: '', reason: '' });
  return (
    <form className="grid gap-4" onSubmit={async (e)=>{ e.preventDefault(); await fetch('/api/admin/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create_block', start: form.start, end: form.end, reason: form.reason || undefined }) }); onClose(); }}>
      <h3 className="heading-serif text-3xl font-normal mb-2">Add one-off block</h3>
      <div>
        <label className="block text-white/70 text-sm mb-2">Start</label>
        <input type="datetime-local" value={form.start} onChange={(e)=>setForm({...form, start: e.target.value})} className="input-field w-full" />
      </div>
      <div>
        <label className="block text-white/70 text-sm mb-2">End</label>
        <input type="datetime-local" value={form.end} onChange={(e)=>setForm({...form, end: e.target.value})} className="input-field w-full" />
      </div>
      <div>
        <label className="block text-white/70 text-sm mb-2">Reason (optional)</label>
        <input type="text" value={form.reason} onChange={(e)=>setForm({...form, reason: e.target.value})} placeholder="e.g., Holiday, Conference" className="input-field w-full" />
      </div>
      <div className="flex justify-end gap-3 mt-2">
        <button type="button" onClick={onClose} className="pill-button px-5 py-2">Cancel</button>
        <button className="pill-button px-5 py-2">Save</button>
      </div>
    </form>
  );
}

function CaseCard({ data, onUpdated }: { data: { id: string; title: string; slug: string; summary: string; content?: string; coverUrl?: string | null; tags?: string[] | null }; onUpdated: (c: { id: string; title: string; slug: string; summary: string; content?: string; coverUrl?: string | null; tags?: string[] | null })=>void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: data.title, slug: data.slug, summary: data.summary, content: data.content || '', coverUrl: data.coverUrl || '', tags: (Array.isArray(data.tags)? data.tags : []).join(', ') });
  async function save() {
    const payload = { title: form.title, slug: form.slug, summary: form.summary, content: form.content, coverUrl: form.coverUrl || undefined, tags: form.tags.split(',').map(s=>s.trim()).filter(Boolean) };
    const res = await fetch(`/api/admin/case-studies/${data.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { const json = await res.json(); onUpdated(json.caseStudy); setEditing(false); }
  }
  return (
    <div className="matte-card p-5">
      {!editing ? (
        <>
          <div className="text-xl font-semibold tracking-tight">{data.title}</div>
          <div className="text-white/80 mt-2 leading-relaxed">{data.summary}</div>
          <div className="mt-4 flex justify-end"><button onClick={()=>setEditing(true)} className="pill-button px-5 py-2">Edit</button></div>
        </>
      ) : (
        <div className="grid gap-4">
          <input value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} className="input-field" placeholder="Title" />
          <input value={form.slug} onChange={(e)=>setForm({...form, slug: e.target.value})} className="input-field" placeholder="Slug" />
          <textarea value={form.summary} onChange={(e)=>setForm({...form, summary: e.target.value})} className="input-field" placeholder="Summary" rows={2} />
          <textarea value={form.content} onChange={(e)=>setForm({...form, content: e.target.value})} className="input-field" placeholder="Content" rows={4} />
          <input value={form.coverUrl} onChange={(e)=>setForm({...form, coverUrl: e.target.value})} className="input-field" placeholder="Cover URL (optional)" />
          <input value={form.tags} onChange={(e)=>setForm({...form, tags: e.target.value})} className="input-field" placeholder="tag1, tag2" />
          <div className="flex gap-3 justify-end">
            <button onClick={()=>setEditing(false)} className="pill-button px-5 py-2">Cancel</button>
            <button onClick={save} className="pill-button px-5 py-2">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}






function CalendarWeek({ weekStart, onPrev, onNext, onToday, bookings, schedule, onOpenBooking, onOpenBlock }: { weekStart: Date; onPrev: () => void; onNext: () => void; onToday: () => void; bookings: Array<{ id: string; startTime?: string | null; endTime?: string | null; status: string; package?: { title: string } }>; schedule: { recurring: Array<{ id: string; weekday: number; startMinutes: number; endMinutes: number; startsOn?: string | null; endsOn?: string | null; reason?: string | null }>; blocks: Array<{ id: string; start: string; end: string; reason?: string | null }> }; onOpenBooking: (b: { id: string; startTime?: string | null; endTime?: string | null; status: string; package?: { title: string } }) => void; onOpenBlock: (type: 'recurring' | 'oneoff', data: any) => void }) {
  const days: Date[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const hours = Array.from({ length: 16 }).map((_, i) => 5 + i); // 05:00–21:00

  function dayLabel(d: Date) {
    const opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat(undefined, opts).format(d);
  }
  function toMinutes(date: Date) { return date.getHours()*60 + date.getMinutes(); }

  // One-off blocks per day
  const blocksByDay: Record<number, Array<{ startMin: number; endMin: number; label: string }>> = { 0:[],1:[],2:[],3:[],4:[],5:[],6:[] };
  for (const b of schedule.blocks) {
    const bs = new Date(b.start); const be = new Date(b.end);
    for (let i = 0; i < 7; i++) {
      const day = days[i];
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate()+1, 0, 0, 0, 0);
      if (bs < dayEnd && be > dayStart) {
        const s = Math.max(0, toMinutes(new Date(Math.max(bs.getTime(), dayStart.getTime()))));
        const e = Math.min(24*60, toMinutes(new Date(Math.min(be.getTime(), dayEnd.getTime()))));
        blocksByDay[i].push({ startMin: s, endMin: e, label: b.reason || 'Blocked' });
      }
    }
  }
  // Recurring per day
  const recByDay: Record<number, Array<{ startMin: number; endMin: number; label: string }>> = { 0:[],1:[],2:[],3:[],4:[],5:[],6:[] };
  for (const r of schedule.recurring) {
    for (let i = 0; i < 7; i++) {
      const d = days[i];
      if (d.getDay() !== r.weekday) continue;
      const inRange = !r.startsOn || new Date(r.startsOn) <= d;
      const notEnded = !r.endsOn || d <= new Date(r.endsOn);
      if (inRange && notEnded) recByDay[i].push({ startMin: r.startMinutes, endMin: r.endMinutes, label: r.reason || 'Recurring block' });
    }
  }
  // Bookings per day
  const bookingsByDay: Record<number, Array<{ id: string; startMin: number; endMin: number; label: string; status: string }>> = { 0:[],1:[],2:[],3:[],4:[],5:[],6:[] };
  for (const b of bookings) {
    if (!b.startTime || !b.endTime) continue;
    const s = new Date(b.startTime); const e = new Date(b.endTime);
    for (let i = 0; i < 7; i++) {
      const day = days[i];
      if (s.getFullYear()===day.getFullYear() && s.getMonth()===day.getMonth() && s.getDate()===day.getDate()) {
        bookingsByDay[i].push({ id: b.id, startMin: toMinutes(s), endMin: toMinutes(e), label: b.package?.title || 'Booking', status: b.status });
      }
    }
  }

  return (
    <div className="rounded-xl border border-white/15 p-3 bg-white/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button className="pill-button px-3 py-1" onClick={onPrev}>Prev</button>
          <button className="pill-button px-3 py-1" onClick={onToday}>Today</button>
          <button className="pill-button px-3 py-1" onClick={onNext}>Next</button>
        </div>
        <div className="text-white/80 text-sm">
          Week of {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(weekStart)}
        </div>
        <div className="text-white/70 text-xs flex items-center gap-3">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-400/70"></span> Booking
          <span className="inline-block w-3 h-3 rounded-sm bg-rose-400/50"></span> Block
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-400/40"></span> Recurring
        </div>
      </div>
          <div className="grid grid-cols-8 gap-2">
        <div className="text-white/70 text-xs" />
        {days.map((d, i) => (
          <div key={i} className="text-white/80 text-xs text-center">{dayLabel(d)}</div>
        ))}
        {hours.map((h) => (
          <div key={`row-${h}`} className="contents">
            <div className="text-white/60 text-xs whitespace-nowrap">{String(h).padStart(2,'0')}:00</div>
            {days.map((_, i) => (
              <div key={`c-${i}-${h}`} className="relative h-16 border border-white/10 rounded-md bg-black/30 overflow-hidden">
                {bookingsByDay[i].map((ev) => {
                  // Render per-hour segment to fully cover duration across rows
                  if (ev.endMin <= h*60 || ev.startMin >= (h+1)*60) return null;
                  const segStart = Math.max(ev.startMin, h*60);
                  const segEnd = Math.min(ev.endMin, (h+1)*60);
                  const top = ((segStart - h*60) / 60) * 100;
                  const height = Math.max(6, ((segEnd - segStart) / 60) * 100);
                  return (
                    <button key={`${ev.id}-${h}`} className={`absolute left-1 right-1 rounded-md shadow transition ${ (bookings.find(x=>x.id===ev.id)?.status==='cancelled') ? 'bg-transparent' : 'bg-emerald-300/90 hover:bg-emerald-200' }`} style={{ top: `${top}%`, height: `${height}%`, minHeight: '14px' }} onClick={(e)=>{ e.stopPropagation(); const b = bookings.find(x=>x.id===ev.id); if (b && b.status!=='cancelled') onOpenBooking(b); }} />
                  );
                })}
                {blocksByDay[i].map((ev, idx) => {
                  if (ev.endMin <= h*60 || ev.startMin >= (h+1)*60) return null;
                  const segStart = Math.max(ev.startMin, h*60);
                  const segEnd = Math.min(ev.endMin, (h+1)*60);
                  const top = ((segStart - h*60) / 60) * 100;
                  const height = Math.max(6, ((segEnd - segStart) / 60) * 100);
                  const block = schedule.blocks.find(b => b.reason === ev.label || (!b.reason && ev.label === 'Blocked'));
                  return (
                    <button key={`b-${idx}-${h}`} className="absolute left-1 right-1 rounded-md bg-rose-400/60 hover:bg-rose-300/70 transition cursor-pointer" style={{ top: `${top}%`, height: `${height}%` }} onClick={(e)=>{ e.stopPropagation(); if (block) onOpenBlock('oneoff', block); }} />
                  );
                })}
                {recByDay[i].map((ev, idx) => {
                  if (ev.endMin <= h*60 || ev.startMin >= (h+1)*60) return null;
                  const segStart = Math.max(ev.startMin, h*60);
                  const segEnd = Math.min(ev.endMin, (h+1)*60);
                  const top = ((segStart - h*60) / 60) * 100;
                  const height = Math.max(6, ((segEnd - segStart) / 60) * 100);
                  const wd = days[i].getDay();
                  const rec = schedule.recurring.find(r => r.weekday === wd && r.startMinutes === ev.startMin && r.endMinutes === ev.endMin);
                  return (
                    <button key={`r-${idx}-${h}`} className="absolute left-1 right-1 rounded-md bg-amber-300/60 hover:bg-amber-200/70 transition cursor-pointer" style={{ top: `${top}%`, height: `${height}%` }} onClick={(e)=>{ e.stopPropagation(); if (rec) onOpenBlock('recurring', rec); }} />
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
