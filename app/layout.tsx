import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
