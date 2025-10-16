export default function Loading() {
  return (
    <main className="min-h-screen text-white pt-24 px-6">
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="h-10 w-64 shimmer rounded-md" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 p-5">
              <div className="h-6 w-40 shimmer rounded" />
              <div className="mt-3 h-20 shimmer rounded" />
              <div className="mt-3 h-10 shimmer rounded" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}



