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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
          <Sidebar />
          <main style={{ flex: 1, background: "var(--background)", display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden" }}>
            {children}
          </main>
        </div>

        <Overlay />
      </body>
    </html>
  );
}
