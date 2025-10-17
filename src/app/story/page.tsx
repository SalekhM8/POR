"use client";
import { useEffect, useState } from "react";

type About = { heading: string; content: string } | null;

export default function StoryPage() {
  const [about, setAbout] = useState<About>(null);
  const [loadingData, setLoadingData] = useState(true);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/about", { cache: "no-store" });
      if (res.ok) setAbout((await res.json()).about);
      setLoadingData(false);
    })();
  }, []);
  return (
    <main className="min-h-screen text-white pt-24 px-6 pb-12">
      <section className="max-w-3xl mx-auto space-y-8">
        <div className="fade-in">
          <h1 className="heading-serif text-5xl md:text-6xl font-normal mb-2">{about?.heading ?? (loadingData ? "" : "My story")}</h1>
        </div>
        {loadingData && !about ? (
          <div className="matte-card p-8 fade-in">
            <div className="h-40 shimmer rounded" />
          </div>
        ) : (
          <div className="matte-card p-8 fade-in">
            <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{about?.content ?? ""}</div>
          </div>
        )}
      </section>
    </main>
  );
}


