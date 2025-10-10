import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { headers } from "next/headers";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import TopRightLogo from "@/components/TopRightLogo";

const heading = Playfair_Display({ subsets: ["latin"], variable: "--font-heading", weight: ["400","500","600","700","800","900"] });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Wellness Bookings",
  description: "Holistic treatments and recovery",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await headers();
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} antialiased bg-black`}> 
        <div className="global-hero-backdrop">
          <video autoPlay loop muted playsInline preload="auto">
            <source src="/path.mp4" type="video/mp4" />
          </video>
        </div>
        <Navbar />
        <TopRightLogo />
        <WhatsAppFloat />
        {children}
      </body>
    </html>
  );
}
