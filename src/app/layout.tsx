import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "계정 관리 시스템",
  description: "SSO 계정 관리 시스템 및 웹메일 계정 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <header className="bg-gray-800 text-white shadow-md">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold">계정 관리 시스템</div>
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <a href="/dashboard" className="hover:text-blue-300 transition">대시보드</a>
                  </li>
                  <li>
                    <a href="/sso" className="hover:text-blue-300 transition">SSO 계정</a>
                  </li>
                  <li>
                    <a href="/webmail" className="hover:text-blue-300 transition">웹메일 계정</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
