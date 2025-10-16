import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import VirtualConsultation from "@/components/VirtualConsultation";

const heading = Playfair_Display({ subsets: ["latin"], variable: "--font-heading", weight: ["400","500","600","700","800","900"] });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Wellness Bookings",
  description: "Holistic treatments and recovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} antialiased bg-black`}> 
        <Navbar />
        <VirtualConsultation />
        {children}
      </body>
    </html>
  );
}
