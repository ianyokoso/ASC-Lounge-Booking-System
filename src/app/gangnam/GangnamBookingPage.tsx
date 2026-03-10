"use client";

import Link from "next/link";
import GangnamBookingForm from "@/components/GangnamBookingForm";

interface GangnamBookingPageProps {
  initialAvailability: Record<string, string[]>;
  initialUser: any;
  initialReservations: any[];
}

export default function GangnamBookingPage({
  initialAvailability,
  initialUser,
  initialReservations,
}: GangnamBookingPageProps) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Navbar */}
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
        <Link href="/" style={{ marginRight: '20px' }}>
          <div
            role="img"
            aria-label="ASC Logo"
            style={{
              width: '60px',
              height: '60px',
              flexShrink: 0,
              backgroundImage: 'url(https://i.imgur.com/kA9tM7m.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              cursor: 'pointer',
              borderRadius: '12px'
            }}
          />
        </Link>
        <div />
      </nav>

      {/* Main Content */}
      <main style={{ paddingBottom: "80px" }}>
        <GangnamBookingForm
          initialAvailability={initialAvailability}
          initialUser={initialUser}
          initialReservations={initialReservations}
        />
      </main>
    </div>
  );
}
