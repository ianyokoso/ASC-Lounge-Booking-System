"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    User as UserIcon,
    Phone,
    MessageCircle,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function GangnamStatusPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "REJECTED">("ALL");

    useEffect(() => {
        fetch("/api/admin/gangnam")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setReservations(data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#f8fafc",
                color: "#64748b",
                fontSize: "16px"
            }}>
                로딩 중...
            </div>
        );
    }

    const filteredReservations = reservations.filter(r => {
        if (filter === "ALL") return true;
        return r.status === filter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <span className="badge badge-pending">대기중</span>;
            case "CONFIRMED":
                return <span className="badge badge-confirmed">승인됨</span>;
            case "REJECTED":
                return <span className="badge badge-rejected">거절됨</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const pendingCount = reservations.filter(r => r.status === "PENDING").length;
    const confirmedCount = reservations.filter(r => r.status === "CONFIRMED").length;
    const rejectedCount = reservations.filter(r => r.status === "REJECTED").length;

    return (
        <main className="status-container">
            <header className="status-header">
                <Link href="/gangnam" className="back-btn">
                    <ArrowLeft size={24} />
                    <span style={{ marginLeft: '8px', fontWeight: 600 }}>강남 예약으로</span>
                </Link>
                <h1>강남 예약 현황</h1>
            </header>

            <section className="stats-section">
                <div className="stat-card">
                    <span className="stat-label">전체</span>
                    <span className="stat-value">{reservations.length}</span>
                </div>
                <div className="stat-card stat-pending">
                    <span className="stat-label">대기중</span>
                    <span className="stat-value">{pendingCount}</span>
                </div>
                <div className="stat-card stat-confirmed">
                    <span className="stat-label">승인됨</span>
                    <span className="stat-value">{confirmedCount}</span>
                </div>
                <div className="stat-card stat-rejected">
                    <span className="stat-label">거절됨</span>
                    <span className="stat-value">{rejectedCount}</span>
                </div>
            </section>

            <section className="list-section">
                <div className="list-header">
                    <h2>예약 목록</h2>
                    <p>ASC 관리자 조회용 (읽기 전용)</p>
                </div>

                <div className="filter-tabs">
                    {(["ALL", "PENDING", "CONFIRMED", "REJECTED"] as const).map(f => {
                        const count = f === "ALL" ? reservations.length
                            : f === "PENDING" ? pendingCount
                            : f === "CONFIRMED" ? confirmedCount
                            : rejectedCount;
                        const label = f === "ALL" ? "전체" : f === "PENDING" ? "대기중" : f === "CONFIRMED" ? "승인됨" : "거절됨";
                        return (
                            <button
                                key={f}
                                className={`tab ${filter === f ? "active" : ""}`}
                                onClick={() => setFilter(f)}
                            >
                                {label} ({count})
                            </button>
                        );
                    })}
                </div>

                {filteredReservations.length > 0 ? (
                    <div className="reservation-list">
                        {filteredReservations.map((r, i) => (
                            <div key={r.id || i} className="reservation-item">
                                <div className="res-info">
                                    <div className="res-user">
                                        <div className="avatar">
                                            {r.name?.[0]?.toUpperCase() || <UserIcon size={14} />}
                                        </div>
                                        <div className="user-text">
                                            <span className="username">{r.name || "알 수 없음"}</span>
                                            <span className="discord">
                                                <MessageCircle size={12} /> {r.discordNickname}
                                            </span>
                                            <span className="phone">
                                                <Phone size={12} /> {r.phoneNumber}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="res-time">
                                        <div className="time-row">
                                            <CalendarIcon size={14} />
                                            <span>{r.date}</span>
                                        </div>
                                        <div className="time-row">
                                            <Clock size={14} />
                                            <span>{r.timeSlot}</span>
                                        </div>
                                    </div>
                                    <div className="res-status">
                                        {getStatusBadge(r.status)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <CalendarIcon size={48} />
                        <p>해당 조건의 예약이 없습니다</p>
                    </div>
                )}
            </section>

            <style jsx>{`
                .status-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    min-height: 100vh;
                    background-color: #f8fafc;
                }
                .status-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                }
                .status-header h1 {
                    font-size: 24px;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0;
                }
                .back-btn {
                    display: flex;
                    align-items: center;
                    color: #64748b;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .back-btn:hover { color: #1e293b; }

                .stats-section {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 20px;
                    text-align: center;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.03);
                }
                .stat-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748b;
                    margin-bottom: 8px;
                }
                .stat-value {
                    display: block;
                    font-size: 28px;
                    font-weight: 800;
                    color: #1e293b;
                }
                .stat-pending .stat-value { color: #92400e; }
                .stat-confirmed .stat-value { color: #166534; }
                .stat-rejected .stat-value { color: #dc2626; }

                .list-section {
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                    padding: 32px;
                }
                .list-header { margin-bottom: 24px; }
                .list-header h2 { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
                .list-header p { font-size: 14px; color: #94a3b8; }

                .filter-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }
                .tab {
                    padding: 8px 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    background: white;
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .tab:hover { border-color: #cbd5e1; }
                .tab.active {
                    background: #1e293b;
                    color: white;
                    border-color: #1e293b;
                }

                .reservation-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .reservation-item {
                    padding: 20px;
                    border: 1px solid #f1f5f9;
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                .reservation-item:hover { border-color: #e2e8f0; }

                .res-info {
                    display: flex;
                    gap: 32px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .res-user {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    min-width: 200px;
                }
                .avatar {
                    width: 40px; height: 40px;
                    background: #e0e7ff;
                    color: #4338ca;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 16px;
                    flex-shrink: 0;
                }
                .user-text {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .username { font-weight: 700; font-size: 15px; color: #1e293b; }
                .discord, .phone {
                    font-size: 12px;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .res-time {
                    display: flex;
                    gap: 16px;
                }
                .time-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    color: #475569;
                    font-weight: 500;
                }

                .res-status { min-width: 80px; }

                .badge {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }
                .badge-pending { background: #fef3c7; color: #92400e; }
                .badge-confirmed { background: #dcfce7; color: #166534; }
                .badge-rejected { background: #fee2e2; color: #dc2626; }

                .empty-state {
                    text-align: center;
                    padding: 60px 0;
                    color: #94a3b8;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }

                @media (max-width: 768px) {
                    .stats-section { grid-template-columns: repeat(2, 1fr); }
                    .res-info { flex-direction: column; align-items: flex-start; gap: 12px; }
                    .res-user { min-width: auto; }
                    .res-time { flex-direction: column; gap: 4px; }
                }
            `}</style>
        </main>
    );
}
