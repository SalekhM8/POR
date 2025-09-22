import Link from "next/link";

export default function TreatmentsPage() {
  return (
    <main className="min-h-screen text-white pt-24 px-6">
      <section className="max-w-5xl mx-auto space-y-6">
        <h1 className="heading-serif text-5xl font-light">Treatments</h1>
        <ul className="grid md:grid-cols-2 gap-6 text-white/90">
          <li>Massages — Deep tissue and sports recovery.</li>
          <li>Wet cupping — Traditional detox and relief.</li>
          <li>Dry cupping — Mobility and circulation.</li>
          <li>Cold plunge & sauna — Contrast therapy.</li>
        </ul>
        <Link href="/start" className="pill-button w-fit">Start your journey</Link>
      </section>
    </main>
  );
}


