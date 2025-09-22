import Link from "next/link";

export default function StoryPage() {
  return (
    <main className="min-h-screen text-white pt-24 px-6">
      <section className="max-w-3xl mx-auto space-y-6">
        <h1 className="heading-serif text-5xl font-light">My story</h1>
        <p className="text-white/80">
          Placeholder: A journey through wellness, recovery, and performance.
        </p>
        <Link href="/start" className="pill-button w-fit">Start your journey</Link>
      </section>
    </main>
  );
}


