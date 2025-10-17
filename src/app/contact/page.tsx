import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen text-white pt-24 px-6 pb-12">
      <section className="max-w-3xl mx-auto space-y-8">
        <div className="fade-in">
          <h1 className="heading-serif text-5xl md:text-6xl font-normal mb-2">Contact us</h1>
          <p className="text-white/60 text-sm tracking-tight">Get in touch to start your journey</p>
        </div>
        <div className="matte-card p-8 fade-in">
          <p className="text-white/70 text-sm leading-relaxed mb-6">Reach out for any questions or to book a consultation. We&apos;ll respond within 24 hours.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/start" className="pill-button">Start your journey</Link>
            <Link href="/admin" className="pill-button">Admin sign in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}


