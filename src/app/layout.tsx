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
  title: "ASC Lounge Booking",
  description: "Lounge booking system for ASC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <nav style={{
          height: '80px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            flexShrink: 0
          }}>
            <img
              src="/asc-logo.svg"
              alt="ASC Logo"
              style={{
                height: '60px',
                width: '60px',
                minHeight: '60px',
                minWidth: '60px',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
            height: '100%'
          }}>
            <a href="/" style={{
              textDecoration: 'none',
              color: '#334155',
              fontSize: '15px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center'
            }}>예약하기</a>
            <a href="/admin" style={{
              textDecoration: 'none',
              color: '#3b82f6',
              fontSize: '15px',
              fontWeight: '700',
              padding: '10px 24px',
              background: '#eff6ff',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              border: '1px solid #dbeafe'
            }}>전체예약현황보기</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
