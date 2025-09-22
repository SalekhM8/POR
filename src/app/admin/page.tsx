"use client";
import { useEffect, useState } from "react";

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

  async function signIn(formData: FormData) {
    setLoading(true);
    const res = await fetch("/api/admin/login", { method: "POST", body: formData });
    setLoading(false);
    if (res.ok) {
      setAuthed(true);
    } else {
      alert("Invalid password");
    }
  }

  useEffect(() => {
    if (!authed) return;
    (async () => {
      const res = await fetch("/api/admin/enquiries");
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries);
      }
    })();
  }, [authed]);

  if (!authed) {
    return (
      <main className="min-h-screen bg-black text-white pt-24 px-6">
        <section className="max-w-sm mx-auto">
          <h1 className="text-3xl mb-6">Admin sign in</h1>
          <form action={signIn} className="space-y-4">
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
    <main className="min-h-screen bg-black text-white pt-24 px-6">
      <section className="max-w-5xl mx-auto">
        <h1 className="text-3xl mb-6">Enquiries</h1>
        <div className="grid gap-4">
          {enquiries.map((e) => (
            <div key={e.id} className="border border-white/20 rounded-lg p-4">
              <div className="flex flex-wrap justify-between gap-2 text-white/80 text-sm">
                <span>{new Date(e.createdAt).toLocaleString()}</span>
                <span className="uppercase tracking-wide">{e.source}</span>
              </div>
              <div className="mt-2 font-semibold">{e.name} — {e.email}{e.phone ? ` — ${e.phone}` : ""}</div>
              <div className="text-white/90 mt-2">{e.message}</div>
              {e.treatment && <div className="mt-2 text-white/70">Treatment: {e.treatment}</div>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}


