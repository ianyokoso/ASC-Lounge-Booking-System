"use client";

import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

export default function Home() {
    const customButtonStyle = {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "320px",
        height: "180px",
        padding: "24px",
        borderRadius: "24px",
        background: "white",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        textDecoration: "none",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid #f1f5f9",
    };

    const locations = [
        {
            name: "구로디지털단지",
            desc: "ASC Guro Lounge",
            href: "/guro",
            isExternal: false,
            color: "#4f46e5",
            bgColor: "#eef2ff",
        },
        {
            name: "안국역",
            desc: "Ankuk Station",
            href: "https://m.booking.naver.com/booking/6/bizes/715955/items/7031202?area=pll&lang=ko&startDate=2025-09-01&theme=place",
            isExternal: true,
            color: "#059669",
            bgColor: "#ecfdf5",
        },
        {
            name: "강남",
            desc: "Gangnam Lounge",
            href: "https://eggstation.spacebring.com/suite/organizations",
            isExternal: true,
            color: "#db2777",
            bgColor: "#fdf2f8",
        },
    ];

    return (
        <main style={{
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        }}>
            <div style={{ marginBottom: "60px", textAlign: "center" }}>
                <div
                    role="img"
                    aria-label="ASC Logo"
                    style={{
                        width: "100px",
                        height: "100px",
                        margin: "0 auto 24px",
                        backgroundImage: "url(https://i.imgur.com/kA9tM7m.png)",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center"
                    }}
                />
                <h1 style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#0f172a",
                    marginBottom: "12px"
                }}>
                    ASC 라운지 예약
                </h1>
                <p style={{ color: "#64748b", fontSize: "16px" }}>이용하실 라운지를 선택해주세요</p>
            </div>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                width: "100%",
                alignItems: "center"
            }}>
                {locations.map((loc) => (
                    <Link
                        key={loc.name}
                        href={loc.href}
                        target={loc.isExternal ? "_blank" : undefined}
                        rel={loc.isExternal ? "noopener noreferrer" : undefined}
                        style={customButtonStyle}
                        className="location-card"
                    >
                        <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            background: loc.bgColor,
                            color: loc.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "16px"
                        }}>
                            <MapPin size={28} />
                        </div>
                        <span style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#1e293b",
                            marginBottom: "4px"
                        }}>
                            {loc.name}
                        </span>
                        <span style={{
                            fontSize: "13px",
                            color: "#94a3b8",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                        }}>
                            {loc.desc} {loc.isExternal && <ArrowRight size={12} />}
                        </span>
                    </Link>
                ))}
            </div>

            <a
                href="https://mellow-melon-4ac.notion.site/ASC-3056400e926880e6975aeb71c204cc0b?source=copy_link"
                target="_blank"
                rel="noopener noreferrer"
                className="notion-link-button"
            >
                <span style={{ marginRight: '8px' }}>🔗</span>
                라운지 이용 규칙 안내
            </a>

            <style jsx global>{`
        .notion-link-button {
          margin-top: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          color: #475569;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .notion-link-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .location-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          border-color: #cbd5e1 !important;
        }
        
        .notice-section-full {
          margin-top: 40px;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          max-width: 600px;
        }
        .notice-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #b45309;
          margin-bottom: 16px;
          font-size: 15px;
        }
        .notice-list-horizontal {
          padding-left: 0; margin: 0; list-style: none;
          display: flex; flex-direction: column; gap: 10px;
        }
        .notice-list-horizontal li {
          font-size: 14px; color: #92400e; display: flex; align-items: center; gap: 6px;
        }
      `}</style>
        </main >
    );
}
