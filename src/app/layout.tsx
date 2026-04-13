import type { Metadata } from "next";
import { Roboto, Montserrat } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Atulyaswar | Music Journal and Notation Editor",
  description:
    "Atulyaswar website with two products: A peer reviewed music journal and an upcoming notation editor.",
  keywords: [
    "Atulyaswar",
    "music journal",
    "peer reviewed journal",
    "notation editor",
    "open access policy",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${montserrat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
