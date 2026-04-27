import type { Metadata } from "next";
import { Irish_Grover } from "next/font/google";
import "./globals.css";
import TopNav from "./_components/TopNav";

const irishGrover = Irish_Grover({
  variable: "--font-irish-grover",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Cat Calendar Creator",
  description: "Sample next app by David Beall",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${irishGrover.variable} antialiased`}>
        <TopNav></TopNav>
        <main className="container mx-auto max-w-7xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
