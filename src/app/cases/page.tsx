import Link from "next/link";

export default function CasesPage() {
  return (
    <main className="min-h-screen text-white pt-24 px-6">
      <section className="max-w-5xl mx-auto space-y-6">
        <h1 className="heading-serif text-5xl font-light">Case studies</h1>
        <div className="space-y-4 text-white/80">
          <p>Placeholder: Transformations and outcomes from real clients.</p>
          <p>We will add detailed stories and media here later.</p>
        </div>
        <Link href="/start" className="pill-button w-fit">Start your journey</Link>
      </section>
    </main>
  );
}


