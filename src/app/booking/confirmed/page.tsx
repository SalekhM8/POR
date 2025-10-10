import Link from "next/link";

export default function BookingConfirmed() {
  return (
    <main className="min-h-screen text-white pt-24 px-6">
      <section className="max-w-3xl mx-auto text-center space-y-6">
        <div className="rounded-3xl border border-white/15 bg-white/5 p-8 shadow-[0_0_24px_rgba(255,255,255,0.08)]">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-300"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h1 className="heading-serif text-4xl font-light mt-4">Request received</h1>
          <p className="text-white/85 leading-relaxed mt-2">
            Thank you for your booking request. We’ll be in touch shortly to select an
            optimal time for your initial consultation and confirm the details.
          </p>
          <p className="text-white/70 mt-2">
            Keep an eye on your email and phone — we’ll coordinate the best time with you.
          </p>
          <Link href="/" className="pill-button mt-6 inline-flex">Back to home</Link>
        </div>
      </section>
    </main>
  );
}


