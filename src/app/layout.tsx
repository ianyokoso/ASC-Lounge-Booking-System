import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
          height: '60px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              backgroundColor: '#1e293b',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>ASC</div>
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
            <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>예약하기</a>
            <a href="/admin" style={{ textDecoration: 'none', color: 'inherit', padding: '6px 12px', background: '#f1f5f9', borderRadius: '6px' }}>전체예약현황보기</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
