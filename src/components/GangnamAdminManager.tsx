"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    User as UserIcon,
    Phone,
    MessageCircle,
    CheckCircle2,
    XCircle,
    Settings,
    Save,
    ChevronLeft,
    ChevronRight,
    Download,
} from "lucide-react";

interface GangnamAdminManagerProps {
    initialReservations: any[];
}

function getHoursFromSlot(slot: string): number {
    const match = slot.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!match) return 2;
    const start = parseInt(match[1]) + parseInt(match[2]) / 60;
    const end = parseInt(match[3]) + parseInt(match[4]) / 60;
    return end - start;
}

export default function GangnamAdminManager({ initialReservations }: GangnamAdminManagerProps) {
    const [reservations, setReservations] = useState<any[]>(initialReservations);
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "REJECTED">("ALL");
    const [managerPhone, setManagerPhone] = useState("");
    const [savedManagerPhone, setSavedManagerPhone] = useState("");
    const [savingPhone, setSavingPhone] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "monthly">("list");

    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

    useEffect(() => {
        fetch("/api/admin/gangnam/settings")
            .then(res => res.json())
            .then(data => {
                setManagerPhone(data.managerPhone || "");
                setSavedManagerPhone(data.managerPhone || "");
            })
            .catch(() => {});
    }, []);

    const monthlyReservations = useMemo(() => {
        return reservations.filter(r => {
            if (!r.date) return false;
            const [y, m] = r.date.split("-").map(Number);
            return y === selectedYear && m === selectedMonth;
        });
    }, [reservations, selectedYear, selectedMonth]);

    const monthlyStats = useMemo(() => {
        const confirmed = monthlyReservations.filter(r => r.status === "CONFIRMED");
        const rejected = monthlyReservations.filter(r => r.status === "REJECTED");
        const cancelled = monthlyReservations.filter(r => r.status === "CANCELLED");
        const totalHours = confirmed.reduce((sum: number, r: any) => sum + getHoursFromSlot(r.timeSlot), 0);
        return {
            total: monthlyReservations.length,
            confirmed: confirmed.length,
            rejected: rejected.length,
            cancelled: cancelled.length,
            totalHours,
        };
    }, [monthlyReservations]);

    const handlePrevMonth = () => {
        if (selectedMonth === 1) { setSelectedYear(y => y - 1); setSelectedMonth(12); }
        else { setSelectedMonth(m => m - 1); }
    };
    const handleNextMonth = () => {
        if (selectedMonth === 12) { setSelectedYear(y => y + 1); setSelectedMonth(1); }
        else { setSelectedMonth(m => m + 1); }
    };

    const handleDownloadCSV = () => {
        const rows = monthlyReservations
            .sort((a: any, b: any) => a.date.localeCompare(b.date))
            .map((r: any) => ({
                날짜: r.date,
                시간: r.timeSlot,
                이름: r.name,
                연락처: r.phoneNumber,
                상태: r.status === "CONFIRMED" ? "승인" : r.status === "REJECTED" ? "거절" : r.status === "CANCELLED" ? (r.cancelledBy === "ADMIN" ? "매니저 취소" : "본인 취소") : "대기",
                이용시간: r.status === "CONFIRMED" ? `${getHoursFromSlot(r.timeSlot)}시간` : "-",
            }));
        if (rows.length === 0) return;
        const header = Object.keys(rows[0]).join(",");
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

    const handleSaveManagerPhone = async () => {
        setSavingPhone(true);
        try {
            const res = await fetch("/api/admin/gangnam/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ managerPhone }),
            });
            if (res.ok) {
                const data = await res.json();
                setSavedManagerPhone(data.managerPhone);
                alert("매니저 번호가 저장되었습니다.");
            } else {
                const data = await res.json();
                alert(data.error || "저장 실패");
            }
        } catch {
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setSavingPhone(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`${name}님의 예약을 취소하시겠습니까? 예약자에게 취소 문자가 발송됩니다.`)) return;
        try {
            const res = await fetch(`/api/admin/gangnam`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                alert("예약이 취소되었습니다.");
                setReservations(prev => prev.map(r => r.id === id ? { ...r, status: "CANCELLED", cancelledBy: "ADMIN" } : r));
            } else {
                const data = await res.json();
                alert(data.error || "취소 실패");
            }
        } catch (err) {
            console.error("Delete error", err);
            alert("처리 중 오류가 발생했습니다.");
        }
    };

    const handleStatusChange = async (id: string, status: "CONFIRMED" | "REJECTED") => {
        const action = status === "CONFIRMED" ? "승인" : "거절";
        if (!confirm(`이 예약을 ${action}하시겠습니까?`)) return;
        try {
            const res = await fetch(`/api/admin/gangnam`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            if (res.ok) {
                alert(`예약이 ${action}되었습니다. 문자가 발송됩니다.`);
                setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            } else {
                const data = await res.json();
                alert(data.error || "처리 실패");
            }
        } catch (err) {
            console.error("Status change error", err);
            alert("처리 중 오류가 발생했습니다.");
        }
    };

    const filteredReservations = reservations.filter(r => {
        if (filter === "ALL") return true;
        return r.status === filter;
    });

    const getStatusBadge = (status: string, cancelledBy?: string) => {
        switch (status) {
            case "PENDING": return <span className="badge badge-pending">대기중</span>;
            case "CONFIRMED": return <span className="badge badge-confirmed">승인됨</span>;
            case "REJECTED": return <span className="badge badge-rejected">거절됨</span>;
            case "CANCELLED": return <span className="badge badge-cancelled">{cancelledBy === "ADMIN" ? "매니저 취소" : "본인 취소"}</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    const pendingCount = reservations.filter(r => r.status === "PENDING").length;

    return (
        <main className="manager-container">
            <header className="manager-header">
                <h1>강남 예약 관리</h1>
            </header>

            <div className="view-toggle">
                <button className={`toggle-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
                    예약 관리
                </button>
                <button className={`toggle-btn ${viewMode === "monthly" ? "active" : ""}`} onClick={() => setViewMode("monthly")}>
                    월별 정산
                </button>
            </div>

            {viewMode === "list" && (
                <>
                    {pendingCount > 0 && (
                        <div className="pending-alert">
                            <span>승인 대기 중인 예약이 {pendingCount}건 있습니다</span>
                        </div>
                    )}

                    <section className="list-section">
                        <div className="list-header">
                            <h2>전체 예약 목록 ({reservations.length})</h2>
                            <p>예약 요청을 승인하거나 거절할 수 있습니다.</p>
                        </div>

                        <div className="filter-tabs">
                            <button className={`tab ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>
                                전체 ({reservations.length})
                            </button>
                            <button className={`tab ${filter === "PENDING" ? "active" : ""}`} onClick={() => setFilter("PENDING")}>
                                대기중 ({reservations.filter(r => r.status === "PENDING").length})
                            </button>
                            <button className={`tab ${filter === "CONFIRMED" ? "active" : ""}`} onClick={() => setFilter("CONFIRMED")}>
                                승인됨 ({reservations.filter(r => r.status === "CONFIRMED").length})
                            </button>
                            <button className={`tab ${filter === "REJECTED" ? "active" : ""}`} onClick={() => setFilter("REJECTED")}>
                                거절됨 ({reservations.filter(r => r.status === "REJECTED").length})
                            </button>
                        </div>

                        {filteredReservations.length > 0 ? (
                            <div className="reservation-list">
                                {filteredReservations.map((r, i) => (
                                    <div key={r.id || i} className={`reservation-item ${r.status === "PENDING" ? "pending" : ""}`}>
                                        <div className="res-info">
                                            <div className="res-user">
                                                <div className="avatar">
                                                    {r.name?.[0]?.toUpperCase() || <UserIcon size={14} />}
                                                </div>
                                                <div className="user-text">
                                                    <span className="username">{r.name || "알 수 없음"}</span>
                                                    <span className="discord"><MessageCircle size={12} /> {r.discordNickname}</span>
                                                    <span className="phone"><Phone size={12} /> {r.phoneNumber}</span>
                                                </div>
                                            </div>
                                            <div className="res-time">
                                                <div className="time-row"><CalendarIcon size={14} /><span>{r.date}</span></div>
                                                <div className="time-row"><Clock size={14} /><span>{r.timeSlot}</span></div>
                                            </div>
                                            <div className="res-status">
                                                {getStatusBadge(r.status, r.cancelledBy)}
                                            </div>
                                        </div>
                                        {r.status !== "REJECTED" && r.status !== "CANCELLED" && (
                                            <div className="res-action">
                                                {r.status === "PENDING" && (
                                                    <>
                                                        <button onClick={() => handleStatusChange(r.id, "CONFIRMED")} className="btn-approve">
                                                            <CheckCircle2 size={16} /> 승인
                                                        </button>
                                                        <button onClick={() => handleStatusChange(r.id, "REJECTED")} className="btn-reject">
                                                            <XCircle size={16} /> 거절
                                                        </button>
                                                    </>
                                                )}
                                                {r.status === "CONFIRMED" && (
                                                    <button onClick={() => handleDelete(r.id, r.name)} className="btn-cancel">
                                                        <XCircle size={16} /> 취소
                                                    </button>
                                                )}
                                            </div>
                                        )}
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

                    <section className="settings-section">
                        <div className="settings-header">
                            <Settings size={18} />
                            <h2>매니저 설정</h2>
                        </div>
                        <div className="settings-row">
                            <label>강남 라운지 매니저 번호</label>
                            <div className="phone-input-group">
                                <input type="tel" value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} placeholder="01012345678" className="phone-input" />
                                <button onClick={handleSaveManagerPhone} disabled={savingPhone || managerPhone === savedManagerPhone} className="btn-save">
                                    <Save size={14} /> {savingPhone ? "저장 중..." : "저장"}
                                </button>
                            </div>
                            <p className="settings-desc">예약 생성 시 이 번호로 SMS 알림이 전송됩니다.</p>
                        </div>
                    </section>
                </>
            )}

            {viewMode === "monthly" && (
                <>
                    <section className="month-nav">
                        <button className="month-btn" onClick={handlePrevMonth}><ChevronLeft size={20} /></button>
                        <h2 className="month-title">{selectedYear}년 {selectedMonth}월</h2>
                        <button className="month-btn" onClick={handleNextMonth}><ChevronRight size={20} /></button>
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
                            <span className="stat-value">{monthlyStats.rejected + monthlyStats.cancelled}</span>
                        </div>
                        <div className="stat-card stat-hours">
                            <span className="stat-label">총 이용시간</span>
                            <span className="stat-value">{monthlyStats.totalHours}<small>h</small></span>
                        </div>
                    </section>

                    <section className="list-section">
                        <div className="list-header-row">
                            <div>
                                <h2>{selectedYear}년 {selectedMonth}월 정산 내역</h2>
                                <p>승인 건 기준으로 이용시간이 계산됩니다</p>
                            </div>
                            {monthlyReservations.length > 0 && (
                                <button className="csv-btn" onClick={handleDownloadCSV}>
                                    <Download size={14} /> CSV 다운로드
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
                .manager-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    min-height: 100vh;
                    background-color: #f8fafc;
                }
                .manager-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                }
                .manager-header h1 {
                    font-size: 24px;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0;
                }

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
                .stat-value small { font-size: 16px; font-weight: 600; color: #64748b; }
                .stat-confirmed .stat-value { color: #166534; }
                .stat-rejected .stat-value { color: #dc2626; }
                .stat-hours .stat-value { color: #6366f1; }

                .settings-section {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                    padding: 24px;
                    margin-top: 24px;
                }
                .settings-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .settings-header h2 { font-size: 16px; font-weight: 800; color: #1e293b; margin: 0; }
                .settings-row label { font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; display: block; }
                .phone-input-group { display: flex; gap: 8px; }
                .phone-input {
                    flex: 1; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px;
                    font-size: 14px; outline: none; transition: border-color 0.2s;
                }
                .phone-input:focus { border-color: #6366f1; }
                .btn-save {
                    display: flex; align-items: center; gap: 6px; padding: 10px 16px;
                    background: #6366f1; color: white; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap;
                }
                .btn-save:hover { background: #4f46e5; }
                .btn-save:disabled { background: #c7d2fe; cursor: not-allowed; }
                .settings-desc { font-size: 12px; color: #94a3b8; margin-top: 8px; }

                .pending-alert {
                    background: #fef3c7; border: 1px solid #fcd34d; color: #92400e;
                    padding: 16px 20px; border-radius: 12px; font-weight: 600; margin-bottom: 24px;
                }

                .list-section {
                    background: white; border-radius: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0; padding: 32px;
                }
                .list-header { margin-bottom: 24px; }
                .list-header h2 { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
                .list-header p { font-size: 14px; color: #64748b; }

                .list-header-row {
                    display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
                }
                .list-header-row h2 { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
                .list-header-row p { font-size: 14px; color: #94a3b8; }

                .csv-btn {
                    display: flex; align-items: center; gap: 6px; padding: 10px 16px;
                    background: #6366f1; color: white; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap;
                }
                .csv-btn:hover { background: #4f46e5; }

                .filter-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
                .tab {
                    padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 20px;
                    background: white; font-size: 13px; font-weight: 600; color: #64748b;
                    cursor: pointer; transition: all 0.2s;
                }
                .tab:hover { border-color: #cbd5e1; }
                .tab.active { background: #1e293b; color: white; border-color: #1e293b; }

                .reservation-list { display: flex; flex-direction: column; gap: 12px; }
                .reservation-item {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 20px; border: 1px solid #f1f5f9; border-radius: 12px; transition: all 0.2s;
                }
                .reservation-item.pending { border-color: #fcd34d; background: #fffbeb; }
                .reservation-item:hover { border-color: #e2e8f0; }

                .res-info { display: flex; gap: 32px; align-items: center; flex-wrap: wrap; }
                .res-user { display: flex; align-items: flex-start; gap: 12px; min-width: 200px; }
                .avatar {
                    width: 40px; height: 40px; background: #e0e7ff; color: #4338ca;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    font-weight: 700; font-size: 16px; flex-shrink: 0;
                }
                .user-text { display: flex; flex-direction: column; gap: 4px; }
                .username { font-weight: 700; font-size: 15px; color: #1e293b; }
                .discord, .phone { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 4px; }
                .res-time { display: flex; gap: 16px; }
                .time-row { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #475569; font-weight: 500; }
                .res-status { min-width: 80px; }

                .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
                .badge-pending { background: #fef3c7; color: #92400e; }
                .badge-confirmed { background: #dcfce7; color: #166534; }
                .badge-rejected { background: #fee2e2; color: #dc2626; }
                .badge-cancelled { background: #f1f5f9; color: #64748b; }

                .res-action { display: flex; gap: 8px; }
                .btn-approve, .btn-reject, .btn-cancel {
                    display: flex; align-items: center; gap: 6px; padding: 10px 16px;
                    border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer;
                    transition: all 0.2s; border: none; white-space: nowrap;
                }
                .btn-approve { background: #dcfce7; color: #166534; }
                .btn-approve:hover { background: #bbf7d0; }
                .btn-reject { background: #fee2e2; color: #dc2626; }
                .btn-reject:hover { background: #fecaca; }
                .btn-cancel { background: #f1f5f9; color: #64748b; }
                .btn-cancel:hover { background: #e2e8f0; color: #dc2626; }

                .table-wrap { overflow-x: auto; }
                .settle-table { width: 100%; border-collapse: collapse; font-size: 14px; }
                .settle-table th {
                    text-align: left; padding: 12px 16px; background: #f8fafc;
                    color: #475569; font-weight: 700; font-size: 13px;
                    border-bottom: 2px solid #e2e8f0; white-space: nowrap;
                }
                .settle-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; white-space: nowrap; }
                .settle-table tbody tr:hover { background: #f8fafc; }
                .settle-table tfoot td {
                    padding: 16px; border-top: 2px solid #e2e8f0; font-weight: 800; background: #f8fafc;
                }
                .foot-label { text-align: right; color: #64748b; }
                .foot-value { color: #1e293b; }

                .empty-state {
                    text-align: center; padding: 60px 0; color: #94a3b8;
                    display: flex; flex-direction: column; align-items: center; gap: 16px;
                }

                @media (max-width: 768px) {
                    .stats-section { grid-template-columns: repeat(2, 1fr); }
                    .res-info { flex-direction: column; align-items: flex-start; gap: 12px; }
                    .res-user { min-width: auto; }
                    .res-time { flex-direction: column; gap: 4px; }
                    .reservation-item { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .res-action { width: 100%; }
                    .btn-approve, .btn-reject { flex: 1; justify-content: center; }
                    .list-header-row { flex-direction: column; gap: 12px; }
                }
            `}</style>
        </main>
    );
}
