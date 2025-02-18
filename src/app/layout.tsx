import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F1 Racing Chatbot",
  description: "Chat with an AI-powered F1 expert, powered by Claude & AstraDB.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}>
        <main className="flex items-center justify-center min-h-screen p-6">
          <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
