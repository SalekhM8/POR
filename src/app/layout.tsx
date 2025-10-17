import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import VirtualConsultation from "@/components/VirtualConsultation";

const heading = DM_Serif_Display({ subsets: ["latin"], variable: "--font-heading", weight: ["400"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body", weight: ["300","400","500","600","700"] });

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
