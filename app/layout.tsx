import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";
import SiteBackground from "@/components/SiteBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Calendrier de l’Avent personnalisable",
  description: "Créez un calendrier de l’Avent magique et partagez-le avec vos proches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased font-sans">
        <div className="flex min-h-screen flex-col">
          <SiteBackground>{children}</SiteBackground>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
