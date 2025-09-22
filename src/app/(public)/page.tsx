import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="heading-serif text-white text-5xl md:text-6xl font-light text-shadow-soft">
          Don&apos;t let him down
        </h1>
        <p className="text-white/90 text-lg md:text-xl heading-serif text-shadow-soft">
          Who? The future you
        </p>
        <Link href="/start" className="pill-button">Start your journey</Link>
      </div>
    </div>
  );
}


