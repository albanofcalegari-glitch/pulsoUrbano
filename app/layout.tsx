import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pulso Urbano",
  description: "Lo que pasa en tu barrio, visto por vecinos. Avisos urbanos y cosas compartidas en un solo mapa.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`dark ${syne.variable} ${dmSans.variable}`}>
      <body className="bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
