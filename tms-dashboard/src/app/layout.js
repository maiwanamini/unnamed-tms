import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Overlay from "@/components/Overlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TMS Dashboard",
  description: "Transportation management dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen`}>
        {/* Top-level layout: full height with sidebar + main content */}
        <div className="flex h-full">
          <Sidebar />
          {/* Main content column: flex-1 with internal scroll area */}
          <main className="flex flex-col flex-1 min-h-0 bg-[var(--background)]">
            <div className="flex-1 min-h-0 overflow-y-auto">
              {children}
            </div>
          </main>
        </div>

        <Overlay />
      </body>
    </html>
  );
}
