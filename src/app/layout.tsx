import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atulyaswar Publication | Where Stories Come Alive",
  description:
    "Atulyaswar Publication — a distinguished publishing house dedicated to bringing extraordinary stories, timeless literature, and powerful voices to readers worldwide.",
  keywords: ["publishing", "books", "literature", "Atulyaswar", "publication"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
