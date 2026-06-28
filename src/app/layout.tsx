import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Overlap — Find a time that works for everyone",
    template: "%s · Overlap",
  },
  description:
    "Free scheduling polls. No login, just share a link and see when your group can meet.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Overlap — Find a time that works for everyone",
    description: "Free scheduling polls. No login required.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${hanken.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <Header />
        <main className="flex-1 w-full max-w-[940px] mx-auto px-5 py-8 pb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
