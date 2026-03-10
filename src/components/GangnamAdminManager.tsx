"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    User as UserIcon,
    Phone,
    MessageCircle,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Settings,
    Save
} from "lucide-react";
import Link from "next/link";

interface GangnamAdminManagerProps {
    initialReservations: any[];
}

export default function GangnamAdminManager({ initialReservations }: GangnamAdminManagerProps) {
    const [reservations, setReservations] = useState<any[]>(initialReservations);
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "REJECTED">("ALL");
    const [managerPhone, setManagerPhone] = useState("");
    const [savedManagerPhone, setSavedManagerPhone] = useState("");
    const [savingPhone, setSavingPhone] = useState(false);

    useEffect(() => {
        fetch("/api/admin/gangnam/settings")
            .then(res => res.json())
            .then(data => {
                setManagerPhone(data.managerPhone || "");
                setSavedManagerPhone(data.managerPhone || "");
            })
            .catch(() => {});
    }, []);

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
        if (!confirm(`${name}님의 예약을 취소(삭제)하시겠습니까? 예약자에게 취소 문자가 발송됩니다.`)) return;

        try {
            const res = await fetch(`/api/admin/gangnam`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                alert("예약이 취소되었습니다.");
                setReservations(prev => prev.filter(r => r.id !== id));
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
                const updated = await res.json();
                alert(`예약이 ${action}되었습니다. 문자가 발송됩니다.`);
                setReservations(prev =>
                    prev.map(r => r.id === id ? { ...r, status } : r)
                );
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

    return (
        <main className="manager-container">
            <header className="manager-header">
                <Link href="/gangnam" className="back-btn">
                    <ArrowLeft size={24} />
                    <span style={{ marginLeft: '8px', fontWeight: 600 }}>강남 예약으로</span>
                </Link>
                <h1>강남 예약 관리</h1>
            </header>

            <section className="settings-section">
                <div className="settings-header">
                    <Settings size={18} />
                    <h2>매니저 설정</h2>
                </div>
                <div className="settings-row">
                    <label>강남 라운지 매니저 번호</label>
                    <div className="phone-input-group">
                        <input
                            type="tel"
                            value={managerPhone}
                            onChange={(e) => setManagerPhone(e.target.value)}
                            placeholder="01012345678"
                            className="phone-input"
                        />
                        <button
                            onClick={handleSaveManagerPhone}
                            disabled={savingPhone || managerPhone === savedManagerPhone}
                            className="btn-save"
                        >
                            <Save size={14} />
                            {savingPhone ? "저장 중..." : "저장"}
                        </button>
                    </div>
                    <p className="settings-desc">예약 생성 시 이 번호로 SMS 알림이 전송됩니다.</p>
                </div>
            </section>

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
                    <button
                        className={`tab ${filter === "ALL" ? "active" : ""}`}
                        onClick={() => setFilter("ALL")}
                    >
                        전체 ({reservations.length})
                    </button>
                    <button
                        className={`tab ${filter === "PENDING" ? "active" : ""}`}
                        onClick={() => setFilter("PENDING")}
                    >
                        대기중 ({reservations.filter(r => r.status === "PENDING").length})
                    </button>
                    <button
                        className={`tab ${filter === "CONFIRMED" ? "active" : ""}`}
                        onClick={() => setFilter("CONFIRMED")}
                    >
                        승인됨 ({reservations.filter(r => r.status === "CONFIRMED").length})
                    </button>
                    <button
                        className={`tab ${filter === "REJECTED" ? "active" : ""}`}
                        onClick={() => setFilter("REJECTED")}
                    >
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
                                {r.status !== "REJECTED" && (
                                    <div className="res-action">
                                        {r.status === "PENDING" && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(r.id, "CONFIRMED")}
                                                    className="btn-approve"
                                                >
                                                    <CheckCircle2 size={16} />
                                                    승인
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(r.id, "REJECTED")}
                                                    className="btn-reject"
                                                >
                                                    <XCircle size={16} />
                                                    거절
                                                </button>
                                            </>
                                        )}
                                        {r.status === "CONFIRMED" && (
                                            <button
                                                onClick={() => handleDelete(r.id, r.name)}
                                                className="btn-cancel"
                                            >
                                                <XCircle size={16} />
                                                취소
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
                    justify-content: space-between;
                    margin-bottom: 24px;
                }
                .manager-header h1 {
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

                .settings-section {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                    padding: 24px;
                    margin-bottom: 24px;
                }
                .settings-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .settings-header h2 {
                    font-size: 16px;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0;
                }
                .settings-row label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #475569;
                    margin-bottom: 8px;
                    display: block;
                }
                .phone-input-group {
                    display: flex;
                    gap: 8px;
                }
                .phone-input {
                    flex: 1;
                    padding: 10px 14px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .phone-input:focus { border-color: #6366f1; }
                .btn-save {
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
                .btn-save:hover { background: #4f46e5; }
                .btn-save:disabled { background: #c7d2fe; cursor: not-allowed; }
                .settings-desc {
                    font-size: 12px;
                    color: #94a3b8;
                    margin-top: 8px;
                }

                .pending-alert {
                    background: #fef3c7;
                    border: 1px solid #fcd34d;
                    color: #92400e;
                    padding: 16px 20px;
                    border-radius: 12px;
                    font-weight: 600;
                    margin-bottom: 24px;
                }

                .list-section {
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                    padding: 32px;
                }
                .list-header { margin-bottom: 24px; }
                .list-header h2 { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
                .list-header p { font-size: 14px; color: #64748b; }

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
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border: 1px solid #f1f5f9;
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                .reservation-item.pending {
                    border-color: #fcd34d;
                    background: #fffbeb;
                }
                .reservation-item:hover {
                    border-color: #e2e8f0;
                }

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

                .res-status {
                    min-width: 80px;
                }

                .badge {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }
                .badge-pending {
                    background: #fef3c7;
                    color: #92400e;
                }
                .badge-confirmed {
                    background: #dcfce7;
                    color: #166534;
                }
                .badge-rejected {
                    background: #fee2e2;
                    color: #dc2626;
                }

                .res-action {
                    display: flex;
                    gap: 8px;
                }
                .btn-approve, .btn-reject, .btn-cancel {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    white-space: nowrap;
                }
                .btn-approve {
                    background: #dcfce7;
                    color: #166534;
                }
                .btn-approve:hover {
                    background: #bbf7d0;
                }
                .btn-reject {
                    background: #fee2e2;
                    color: #dc2626;
                }
                .btn-reject:hover {
                    background: #fecaca;
                }
                .btn-cancel {
                    background: #f1f5f9;
                    color: #64748b;
                }
                .btn-cancel:hover {
                    background: #e2e8f0;
                    color: #dc2626;
                }

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
                    .res-info { flex-direction: column; align-items: flex-start; gap: 12px; }
                    .res-user { min-width: auto; }
                    .res-time { flex-direction: column; gap: 4px; }
                    .reservation-item { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .res-action { width: 100%; }
                    .btn-approve, .btn-reject { flex: 1; justify-content: center; }
                }
            `}</style>
        </main>
    );
}
