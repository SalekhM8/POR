"use client";
import Image from "next/image";

const photos = [
  { src: "/image1.JPG", alt: "Gallery Image 1" },
  { src: "/image2.JPG", alt: "Gallery Image 2" },
  { src: "/image3.JPG", alt: "Gallery Image 3" },
  { src: "/image4.JPG", alt: "Gallery Image 4" },
  { src: "/image5.JPG", alt: "Gallery Image 5" },
  { src: "/image6.JPG", alt: "Gallery Image 6" },
];

export default function PhotosPage() {
  return (
    <main className="min-h-screen text-white pt-24 px-6 pb-12">
      <section className="max-w-7xl mx-auto space-y-8">
        <div className="fade-in">
          <h1 className="heading-serif text-5xl md:text-6xl font-normal mb-2">Photos</h1>
          <p className="text-white/60 text-sm tracking-tight">Moments from our journey</p>
        </div>

        {/* Grid gallery for desktop, horizontal scroll for mobile */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in" style={{ animationDelay: "200ms" }}>
          {photos.map((photo, i) => (
            <div
              key={i}
              className="relative w-full aspect-square group fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] cursor-pointer">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* Horizontal scrolling for mobile */}
        <div className="md:hidden flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory -mx-6 px-6 fade-in" style={{ animationDelay: "200ms" }}>
          {photos.map((photo, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-[85vw] aspect-square snap-center"
            >
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="85vw"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint for mobile only */}
        <div className="md:hidden text-center text-white/40 text-sm fade-in" style={{ animationDelay: "400ms" }}>
          ← Swipe to explore →
        </div>
      </section>
    </main>
  );
}

