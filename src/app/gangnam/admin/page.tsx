"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    User as UserIcon,
    Phone,
    MessageCircle,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Download,
} from "lucide-react";
import Link from "next/link";

function getHoursFromSlot(slot: string): number {
    const match = slot.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!match) return 2;
    const start = parseInt(match[1]) + parseInt(match[2]) / 60;
    const end = parseInt(match[3]) + parseInt(match[4]) / 60;
    return end - start;
}

export default function GangnamStatusPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "REJECTED">("ALL");

    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [viewMode, setViewMode] = useState<"list" | "monthly">("list");

    useEffect(() => {
        fetch("/api/admin/gangnam")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setReservations(data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const monthlyReservations = useMemo(() => {
        return reservations.filter(r => {
            const d = r.date;
            if (!d) return false;
            const [y, m] = d.split("-").map(Number);
            return y === selectedYear && m === selectedMonth;
        });
    }, [reservations, selectedYear, selectedMonth]);

    const monthlyStats = useMemo(() => {
        const confirmed = monthlyReservations.filter(r => r.status === "CONFIRMED");
        const rejected = monthlyReservations.filter(r => r.status === "REJECTED");
        const pending = monthlyReservations.filter(r => r.status === "PENDING");
        const cancelled = monthlyReservations.filter(r => r.status === "CANCELLED");
        const totalHours = confirmed.reduce((sum, r) => sum + getHoursFromSlot(r.timeSlot), 0);
        return {
            total: monthlyReservations.length,
            confirmed: confirmed.length,
            rejected: rejected.length,
            pending: pending.length,
            cancelled: cancelled.length,
            totalHours,
        };
    }, [monthlyReservations]);

    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedYear(y => y - 1);
            setSelectedMonth(12);
        } else {
            setSelectedMonth(m => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedYear(y => y + 1);
            setSelectedMonth(1);
        } else {
            setSelectedMonth(m => m + 1);
        }
    };

    const handleDownloadCSV = () => {
        const rows = monthlyReservations
            .sort((a: any, b: any) => a.date.localeCompare(b.date))
            .map((r: any) => ({
                날짜: r.date,
                시간: r.timeSlot,
                이름: r.name,
                연락처: r.phoneNumber,
                디스코드: r.discordNickname,
                상태: r.status === "CONFIRMED" ? "승인" : r.status === "REJECTED" ? "거절" : r.status === "CANCELLED" ? (r.cancelledBy === "ADMIN" ? "매니저 취소" : "본인 취소") : "대기",
                이용시간: r.status === "CONFIRMED" ? `${getHoursFromSlot(r.timeSlot)}시간` : "-",
            }));

        const header = Object.keys(rows[0] || {}).join(",");
        const body = rows.map((row: any) => Object.values(row).join(",")).join("\n");
        const csv = "\uFEFF" + header + "\n" + body;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `강남라운지_${selectedYear}년${selectedMonth}월_정산.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

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

    const getStatusBadge = (status: string, cancelledBy?: string) => {
        switch (status) {
            case "PENDING":
                return <span className="badge badge-pending">대기중</span>;
            case "CONFIRMED":
                return <span className="badge badge-confirmed">승인됨</span>;
            case "REJECTED":
                return <span className="badge badge-rejected">거절됨</span>;
            case "CANCELLED":
                return <span className="badge badge-cancelled">{cancelledBy === "ADMIN" ? "매니저 취소" : "본인 취소"}</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const pendingCount = reservations.filter(r => r.status === "PENDING").length;
    const confirmedCount = reservations.filter(r => r.status === "CONFIRMED").length;
    const rejectedCount = reservations.filter(r => r.status === "REJECTED").length;
    const cancelledCount = reservations.filter(r => r.status === "CANCELLED").length;

    return (
        <main className="status-container">
            <header className="status-header">
                <Link href="/gangnam" className="back-btn">
                    <ArrowLeft size={24} />
                    <span style={{ marginLeft: '8px', fontWeight: 600 }}>강남 예약으로</span>
                </Link>
                <h1>강남 예약 현황</h1>
            </header>

            <div className="view-toggle">
                <button
                    className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => setViewMode("list")}
                >
                    전체 목록
                </button>
                <button
                    className={`toggle-btn ${viewMode === "monthly" ? "active" : ""}`}
                    onClick={() => setViewMode("monthly")}
                >
                    월별 정산
                </button>
            </div>

            {viewMode === "list" && (
                <>
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
                                                {getStatusBadge(r.status, r.cancelledBy)}
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
                </>
            )}

            {viewMode === "monthly" && (
                <>
                    <section className="month-nav">
                        <button className="month-btn" onClick={handlePrevMonth}>
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="month-title">{selectedYear}년 {selectedMonth}월</h2>
                        <button className="month-btn" onClick={handleNextMonth}>
                            <ChevronRight size={20} />
                        </button>
                    </section>

                    <section className="stats-section">
                        <div className="stat-card">
                            <span className="stat-label">총 예약</span>
                            <span className="stat-value">{monthlyStats.total}</span>
                        </div>
                        <div className="stat-card stat-confirmed">
                            <span className="stat-label">승인</span>
                            <span className="stat-value">{monthlyStats.confirmed}</span>
                        </div>
                        <div className="stat-card stat-rejected">
                            <span className="stat-label">거절/취소</span>
                            <span className="stat-value">{monthlyStats.rejected}</span>
                        </div>
                        <div className="stat-card stat-hours">
                            <span className="stat-label">총 이용시간</span>
                            <span className="stat-value">{monthlyStats.totalHours}<small>h</small></span>
                        </div>
                    </section>

                    <section className="list-section">
                        <div className="list-header">
                            <div>
                                <h2>{selectedYear}년 {selectedMonth}월 정산 내역</h2>
                                <p>승인 건 기준으로 이용시간이 계산됩니다</p>
                            </div>
                            {monthlyReservations.length > 0 && (
                                <button className="csv-btn" onClick={handleDownloadCSV}>
                                    <Download size={14} />
                                    CSV 다운로드
                                </button>
                            )}
                        </div>

                        {monthlyReservations.length > 0 ? (
                            <div className="table-wrap">
                                <table className="settle-table">
                                    <thead>
                                        <tr>
                                            <th>날짜</th>
                                            <th>시간</th>
                                            <th>이름</th>
                                            <th>연락처</th>
                                            <th>상태</th>
                                            <th>이용시간</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthlyReservations
                                            .sort((a: any, b: any) => a.date.localeCompare(b.date))
                                            .map((r: any, i: number) => (
                                            <tr key={r.id || i}>
                                                <td>{r.date}</td>
                                                <td>{r.timeSlot}</td>
                                                <td>{r.name}</td>
                                                <td>{r.phoneNumber}</td>
                                                <td>{getStatusBadge(r.status, r.cancelledBy)}</td>
                                                <td>{r.status === "CONFIRMED" ? `${getHoursFromSlot(r.timeSlot)}시간` : "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={4} className="foot-label">합계</td>
                                            <td className="foot-value">승인 {monthlyStats.confirmed}건</td>
                                            <td className="foot-value">{monthlyStats.totalHours}시간</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <CalendarIcon size={48} />
                                <p>{selectedYear}년 {selectedMonth}월 예약 내역이 없습니다</p>
                            </div>
                        )}
                    </section>
                </>
            )}

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

                .view-toggle {
                    display: flex;
                    gap: 4px;
                    background: #e2e8f0;
                    border-radius: 12px;
                    padding: 4px;
                    margin-bottom: 24px;
                }
                .toggle-btn {
                    flex: 1;
                    padding: 10px 16px;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: transparent;
                    color: #64748b;
                }
                .toggle-btn.active {
                    background: white;
                    color: #1e293b;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.08);
                }

                .month-nav {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .month-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: #1e293b;
                    min-width: 160px;
                    text-align: center;
                }
                .month-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    background: white;
                    cursor: pointer;
                    color: #475569;
                    transition: all 0.2s;
                }
                .month-btn:hover { background: #f1f5f9; }

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
                .stat-value small {
                    font-size: 16px;
                    font-weight: 600;
                    color: #64748b;
                }
                .stat-pending .stat-value { color: #92400e; }
                .stat-confirmed .stat-value { color: #166534; }
                .stat-rejected .stat-value { color: #dc2626; }
                .stat-hours .stat-value { color: #6366f1; }

                .list-section {
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                    padding: 32px;
                }
                .list-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                }
                .list-header h2 { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
                .list-header p { font-size: 14px; color: #94a3b8; }

                .csv-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 16px;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .csv-btn:hover { background: #4f46e5; }

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
                .badge-cancelled { background: #f1f5f9; color: #64748b; }

                .table-wrap {
                    overflow-x: auto;
                }
                .settle-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }
                .settle-table th {
                    text-align: left;
                    padding: 12px 16px;
                    background: #f8fafc;
                    color: #475569;
                    font-weight: 700;
                    font-size: 13px;
                    border-bottom: 2px solid #e2e8f0;
                    white-space: nowrap;
                }
                .settle-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    color: #1e293b;
                    white-space: nowrap;
                }
                .settle-table tbody tr:hover { background: #f8fafc; }
                .settle-table tfoot td {
                    padding: 16px;
                    border-top: 2px solid #e2e8f0;
                    font-weight: 800;
                    background: #f8fafc;
                }
                .foot-label { text-align: right; color: #64748b; }
                .foot-value { color: #1e293b; }

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
                    .list-header { flex-direction: column; gap: 12px; }
                }
            `}</style>
        </main>
    );
}
