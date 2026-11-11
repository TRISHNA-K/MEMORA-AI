import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEMORA AI | Research Runtime & Evaluation Suite",
  description: "A Human-Centered AI System with Long-Term Memory, GraphRAG, and Adaptive Personalization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#07090F] text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
