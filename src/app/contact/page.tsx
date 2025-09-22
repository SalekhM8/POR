import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen text-white pt-24 px-6">
      <section className="max-w-3xl mx-auto space-y-6">
        <h1 className="heading-serif text-5xl font-light">Contact us</h1>
        <p className="text-white/80">Placeholder contact details will go here.</p>
        <div className="flex gap-4">
          <Link href="/start" className="pill-button">Start your journey</Link>
          <Link href="/admin" className="pill-button">Sign in</Link>
        </div>
      </section>
    </main>
  );
}


