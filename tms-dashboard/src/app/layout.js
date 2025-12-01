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
        <div className="flex h-full overflow-hidden">
          <Sidebar />
          {/* Main content column: disable outer scroll; children manage internal scroll */}
          <main className="flex flex-col flex-1 min-h-0 bg-[var(--background)] overflow-hidden">
            {/* Remove this overflow-y-auto to prevent page-level scroll */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {children}
            </div>
          </main>
        </div>

        <Overlay />
      </body>
    </html>
  );
}
