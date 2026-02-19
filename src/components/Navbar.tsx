"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering until mounted
    // Or just render simpler version. 
    // Actually, pathname is available on server if using middleware, but usePathname is client hook.
    // For now, if we are on admin, we return null.

    if (!mounted) return null; // Avoid hydration mismatch for now, or use a better strategy if invisible on load is bad. 
    // Better: just render. usePathname works on client side.

    // Hide navbar on admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
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
            <div
                role="img"
                aria-label="ASC Logo"
                style={{
                    width: '60px',
                    height: '60px',
                    flexShrink: 0,
                    marginRight: '20px',
                    backgroundImage: 'url(https://i.imgur.com/kA9tM7m.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }}
            />
            <div style={{
                height: '100%',
                flexShrink: 0
            }}>
                <Link href="/guro" style={{
                    textDecoration: 'none',
                    color: '#334155',
                    fontSize: '15px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 16px',
                    border: '1px solid transparent',
                    lineHeight: '1'
                }}>예약하기</Link>
                <Link href="/guro/status" style={{
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
                    border: '1px solid #dbeafe',
                    lineHeight: '1',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.05)'
                }}>전체예약현황보기</Link>
            </div>
        </nav >
    );
}
