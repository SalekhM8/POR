"use client";
import { useEffect, useState } from "react";

type About = { heading: string; content: string } | null;

export default function StoryPage() {
  const [about, setAbout] = useState<About>(null);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/about", { cache: "no-store" });
      if (res.ok) setAbout((await res.json()).about);
    })();
  }, []);
  return (
    <main className="min-h-screen text-white pt-24 px-6">
      <section className="max-w-3xl mx-auto space-y-6">
        <h1 className="heading-serif text-5xl font-light">{about?.heading ?? "My story"}</h1>
        <div className="text-white/80 whitespace-pre-wrap">{about?.content ?? ""}</div>
      </section>
    </main>
  );
}


