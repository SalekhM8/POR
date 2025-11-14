export default function Loading() {
  return (
    <main className="min-h-screen text-white pt-24 px-6">
      <section className="max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-48 shimmer rounded-md" />
        <div className="flex gap-6 overflow-x-auto pb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[85vw] md:w-[400px] h-[400px] md:h-[500px] rounded-[2rem] md:rounded-[3rem] shimmer" />
          ))}
        </div>
      </section>
    </main>
  );
}

