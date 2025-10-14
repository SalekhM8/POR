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
  const [tab, setTab] = useState<"enquiries" | "packages" | "cases" | "about" | "bookings">("enquiries");
  type AdminPackage = { id: string; title: string; slug: string; description: string; features?: string[]; priceCents: number; durationMin: number };
  type AdminCase = { id: string; title: string; slug: string; summary: string; content?: string; coverUrl?: string | null; tags?: string[] | null };
  type AdminAbout = { id: string; heading: string; content: string; heroUrl?: string | null } | null;
  type AdminBooking = { id: string; name: string; email: string; phone?: string | null; status: string; createdAt: string; package?: { title: string } };
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [about, setAbout] = useState<AdminAbout>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [openEnquiry, setOpenEnquiry] = useState<Enquiry | null>(null);

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
      const [pkgsRes, csRes, aboutRes, bookingsRes] = await Promise.all([
        fetch("/api/admin/packages"),
        fetch("/api/admin/case-studies"),
        fetch("/api/admin/about"),
        fetch("/api/admin/bookings"),
      ]);
      if (pkgsRes.ok) setPackages((await pkgsRes.json()).packages);
      if (csRes.ok) setCases((await csRes.json()).cases);
      if (aboutRes.ok) setAbout((await aboutRes.json()).about);
      if (bookingsRes.ok) setBookings((await bookingsRes.json()).bookings);
    })();
  }, [authed]);

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
    <main className={`${adminSans.variable} min-h-screen bg-[#0b0b0c] text-white pt-6 md:pt-10 px-4 md:px-6`} style={{ fontFamily: "var(--font-admin), var(--font-body), ui-sans-serif, system-ui" }}>
      <section className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold">Dashboard</h1>
          <button onClick={signOut} className="pill-button px-5 py-2">Sign out</button>
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
            ] as const).map((item) => (
              <button key={item.key} onClick={() => setTab(item.key)} className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition ${tab===item.key ? "bg-white/15 border-white/20" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                <span className="opacity-90">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </aside>

          {/* Main content */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="text-sm text-white/70">Enquiries</div>
                <div className="text-2xl font-semibold mt-1">{enquiries.length}</div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="text-sm text-white/70">Packages</div>
                <div className="text-2xl font-semibold mt-1">{packages.length}</div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="text-sm text-white/70">Case studies</div>
                <div className="text-2xl font-semibold mt-1">{cases.length}</div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="text-sm text-white/70">Bookings</div>
                <div className="text-2xl font-semibold mt-1">{bookings.length}</div>
              </div>
            </div>

            {/* Mobile nav pills */}
            <nav className="md:hidden mb-6 backdrop-blur bg-white/10 border border-white/15 rounded-full shadow-md px-2 py-1 w-full overflow-x-auto no-scrollbar">
              {(["enquiries","packages","cases","about","bookings"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-sm mr-1 md:mr-2 ${tab===t?"bg-white/20":"opacity-80 hover:opacity-100"}`}>{t}</button>
              ))}
            </nav>

        {tab === "enquiries" && (
        <div className="grid gap-4">
          {enquiries.map((e) => (
              <button key={e.id} onClick={() => setOpenEnquiry(e)} className="text-left border border-white/20 rounded-lg p-4 hover:bg-white/5 transition">
              <div className="flex flex-wrap justify-between gap-2 text-white/80 text-sm">
                <span>{new Date(e.createdAt).toLocaleString()}</span>
                <span className="uppercase tracking-wide">{e.source}</span>
              </div>
              <div className="mt-2 font-semibold">{e.name} — {e.email}{e.phone ? ` — ${e.phone}` : ""}</div>
              <div className="text-white/90 mt-2">{e.message}</div>
                {/* Interested area was collected but final treatment is decided in consultation */}
              </button>
            ))}
          </div>
        )}

        {openEnquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpenEnquiry(null)} />
            <div className="relative max-w-2xl w-full rounded-2xl border border-white/15 bg-black/90 p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-semibold">{openEnquiry.name}</h3>
                <button onClick={() => setOpenEnquiry(null)} className="pill-button px-4 py-1">Close</button>
              </div>
              <div className="text-white/80 mt-2">{openEnquiry.email}{openEnquiry.phone ? ` — ${openEnquiry.phone}` : ""}</div>
              <div className="text-white/80 mt-4 whitespace-pre-wrap">{openEnquiry.message}</div>
              {/** Render JSON answers if present */}
              { (openEnquiry as unknown as { answers?: Record<string, unknown> }).answers && (
                <div className="mt-4 grid gap-2 text-white/80">
                  {Object.entries(((openEnquiry as unknown as { answers?: Record<string, unknown> }).answers) as Record<string, unknown>).map(([k,v]) => (
                    <div key={k} className="flex gap-2"><span className="text-white/60 min-w-36 capitalize">{k}:</span><span className="flex-1">{String(v)}</span></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "packages" && (
          <div className="grid gap-4">
            <div className="border border-white/20 rounded-lg p-4">
              <h2 className="text-xl mb-3">Packages</h2>
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
                <input name="title" placeholder="Title" className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <input name="slug" placeholder="Slug" className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <textarea name="description" placeholder="Description" className="md:col-span-2 bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <textarea name="features" placeholder="Features (one per line)" className="md:col-span-2 bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <div className="flex items-center bg-transparent border border-white/25 rounded-md px-3 py-2">
                  <span className="text-white/80 mr-2">£</span>
                  <input name="price" type="number" step="0.01" placeholder="Price" className="bg-transparent w-full outline-none placeholder-white/60" />
                </div>
                <input name="durationMin" type="number" placeholder="Duration (min)" className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <select name="tier" className="bg-transparent border border-white/25 rounded-md px-3 py-2 text-white">
                  <option value="" className="text-black">Tier (optional)</option>
                  <option value="bronze" className="text-black">Bronze</option>
                  <option value="silver" className="text-black">Silver</option>
                  <option value="gold" className="text-black">Gold</option>
                  <option value="platinum" className="text-black">Platinum</option>
                </select>
                <select name="category" className="bg-transparent border border-white/25 rounded-md px-3 py-2 text-white">
                  <option value="treatment" className="text-black">Treatments</option>
                  <option value="personal_training" className="text-black">Personal Training</option>
                </select>
                <input name="imageUrl" placeholder="Image URL" className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
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
            <div className="border border-white/20 rounded-lg p-4">
              <h2 className="text-xl mb-3">Case studies</h2>
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
                <input name="title" placeholder="Title" className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <input name="slug" placeholder="Slug" className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <input name="coverUrl" placeholder="Cover URL" className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <input name="tags" placeholder="Tags (comma-separated)" className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <textarea name="summary" placeholder="Summary" className="md:col-span-2 bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <textarea name="content" placeholder="Content" className="md:col-span-2 bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
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
            <div className="border border-white/20 rounded-lg p-4">
              <h2 className="text-xl mb-3">About content</h2>
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
                <input name="heading" placeholder="Heading" defaultValue={about?.heading || ''} className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <input name="heroUrl" placeholder="Hero URL (optional)" defaultValue={about?.heroUrl || ''} className="bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
                <textarea name="content" placeholder="Content" defaultValue={about?.content || ''} className="min-h-40 bg-transparent border border-white/25 rounded-md px-3 py-2 placeholder-white/60" />
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
            {bookings.map((b) => (
              <div key={b.id} className="border border-white/20 rounded-lg p-4">
                <div className="flex flex-wrap justify-between gap-2 text-white/80 text-sm">
                  <span>{new Date(b.createdAt).toLocaleString()}</span>
                  <span className="uppercase tracking-wide">{b.status}</span>
                </div>
                <div className="mt-2 font-semibold">{b.name} — {b.email}{b.phone ? ` — ${b.phone}` : ""}</div>
                <div className="text-white/80 mt-1">{b.package?.title ?? "Package"}</div>
                <div className="mt-3 flex gap-2">
                  {["pending","confirmed","cancelled"].map((s) => (
                    <button key={s} onClick={async () => {
                      const res = await fetch('/api/admin/bookings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: b.id, status: s }) });
                      if (res.ok) {
                        const { booking } = await res.json();
                        setBookings((arr) => arr.map((x) => x.id===b.id? { ...x, status: booking.status } : x));
                      }
                    }} className={`px-3 py-1 rounded-full text-sm ${b.status===s? 'bg-white/20':'bg-white/10 hover:bg-white/20'}`}>{s}</button>
                  ))}
                </div>
            </div>
          ))}
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
  const [form, setForm] = useState({ title: pkg.title, description: pkg.description, features: (pkg.features||[]).join("\n"), priceCents: String(pkg.priceCents), durationMin: String(pkg.durationMin), imageUrl: pkg.imageUrl || "", tier: pkg.tier || "" });
  async function save() {
    const payload = {
      title: form.title,
      description: form.description,
      features: form.features.split("\n").map(s=>s.trim()).filter(Boolean),
      priceCents: Number(form.priceCents||0),
      durationMin: Number(form.durationMin||0),
      imageUrl: form.imageUrl || undefined,
      tier: form.tier || undefined,
    };
    const res = await fetch(`/api/admin/packages/${pkg.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { const data = await res.json(); onUpdated(data.package); setEditing(false); }
  }
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-5 shadow-[0_0_24px_rgba(255,255,255,0.08)] hover:shadow-[0_0_32px_rgba(255,255,255,0.14)] transition">
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
        <div className="grid gap-3">
          <input value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} className="bg-transparent border border-white/25 rounded-md px-3 py-2" />
          <textarea value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} className="bg-transparent border border-white/25 rounded-md px-3 py-2" />
          <textarea value={form.features} onChange={(e)=>setForm({...form, features: e.target.value})} className="bg-transparent border border-white/25 rounded-md px-3 py-2" placeholder="Features (one per line)" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.priceCents} onChange={(e)=>setForm({...form, priceCents: e.target.value})} className="bg-transparent border border-white/25 rounded-md px-3 py-2" placeholder="Price (pence)" />
            <input value={form.durationMin} onChange={(e)=>setForm({...form, durationMin: e.target.value})} className="bg-transparent border border-white/25 rounded-md px-3 py-2" placeholder="Duration (min)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.tier} onChange={(e)=>setForm({...form, tier: e.target.value})} className="bg-transparent border border-white/25 rounded-md px-3 py-2 text-white">
              <option value="" className="text-black">Tier (optional)</option>
              <option value="bronze" className="text-black">Bronze</option>
              <option value="silver" className="text-black">Silver</option>
              <option value="gold" className="text-black">Gold</option>
              <option value="platinum" className="text-black">Platinum</option>
            </select>
            <input value={form.imageUrl} onChange={(e)=>setForm({...form, imageUrl: e.target.value})} className="bg-transparent border border-white/25 rounded-md px-3 py-2" placeholder="Image URL" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={()=>setEditing(false)} className="pill-button px-5 py-2">Cancel</button>
            <button onClick={save} className="pill-button px-5 py-2">Save</button>
          </div>
        </div>
      )}
    </div>
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
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-5 shadow-[0_0_24px_rgba(255,255,255,0.08)]">
      {!editing ? (
        <>
          <div className="text-xl font-semibold tracking-tight">{data.title}</div>
          <div className="text-white/80 mt-2 leading-relaxed">{data.summary}</div>
          <div className="mt-4 flex justify-end"><button onClick={()=>setEditing(true)} className="pill-button px-5 py-2">Edit</button></div>
        </>
      ) : (
        <div className="grid gap-3">
          <input value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} className="bg-transparent border border-white/25 rounded-md px-3 py-2" />
          <input value={form.slug} onChange={(e)=>setForm({...form, slug: e.target.value})} className="bg-transparent border border-white/25 rounded-md px-3 py-2" />
          <textarea value={form.summary} onChange={(e)=>setForm({...form, summary: e.target.value})} className="bg-transparent border border-white/25 rounded-md px-3 py-2" />
          <textarea value={form.content} onChange={(e)=>setForm({...form, content: e.target.value})} className="bg-transparent border border-white/25 rounded-md px-3 py-2" />
          <input value={form.coverUrl} onChange={(e)=>setForm({...form, coverUrl: e.target.value})} className="bg-transparent border border-white/25 rounded-md px-3 py-2" placeholder="Cover URL" />
          <input value={form.tags} onChange={(e)=>setForm({...form, tags: e.target.value})} className="bg-transparent border border-white/25 rounded-md px-3 py-2" placeholder="tag1, tag2" />
          <div className="flex gap-2 justify-end">
            <button onClick={()=>setEditing(false)} className="pill-button px-5 py-2">Cancel</button>
            <button onClick={save} className="pill-button px-5 py-2">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}





