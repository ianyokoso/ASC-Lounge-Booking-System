"use client";

import { useState } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    User as UserIcon,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface AdminManagerProps {
    initialReservations: any[];
}

export default function AdminManager({ initialReservations }: AdminManagerProps) {
    const [reservations, setReservations] = useState<any[]>(initialReservations);

    const handleCancel = async (id: string) => {
        if (!confirm("정말 이 예약을 취소하시겠습니까?\n취소 후에는 복구할 수 없습니다.")) return;

        try {
            const res = await fetch(`/api/admin/reservations?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("예약이 취소되었습니다.");
                setReservations(prev => prev.filter(r => r.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || "취소 실패");
            }
        } catch (err) {
            console.error("Cancel error", err);
            alert("처리 중 오류가 발생했습니다.");
        }
    };

    return (
        <main className="manager-container">
            <header className="manager-header">
                <Link href="/" className="back-btn">
                    <ArrowLeft size={24} />
                    <span style={{ marginLeft: '8px', fontWeight: 600 }}>홈으로</span>
                </Link>
                <h1>예약 관리</h1>
            </header>

            <section className="list-section">
                <div className="list-header">
                    <h2>전체 예약 목록 ({reservations.length})</h2>
                    <p>등록된 모든 예약을 조회하고 취소할 수 있습니다.</p>
                </div>

                {reservations.length > 0 ? (
                    <div className="reservation-list">
                        {reservations.map((r, i) => (
                            <div key={r.id || i} className="reservation-item">
                                <div className="res-info">
                                    <div className="res-user">
                                        <div className="avatar">
                                            {r.user?.username?.[0]?.toUpperCase() || <UserIcon size={14} />}
                                        </div>
                                        <div className="user-text">
                                            <span className="username">{r.user?.username || "알 수 없음"}</span>
                                            <span className="realname">{r.user?.name || ""}</span>
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
                                </div>
                                <div className="res-action">
                                    <button
                                        onClick={() => handleCancel(r.id)}
                                        className="btn-cancel"
                                    >
                                        예약 취소
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <CalendarIcon size={48} />
                        <p>예약 내역이 없습니다</p>
                    </div>
                )}
            </section>

            <style jsx>{`
                .manager-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    min-height: 100vh;
                    background-color: #f8fafc;
                }
                .manager-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 40px;
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

                .reservation-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .reservation-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    border: 1px solid #f1f5f9;
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                .reservation-item:hover {
                    background: #f8fafc;
                    border-color: #e2e8f0;
                }

                .res-info {
                    display: flex;
                    gap: 24px;
                    align-items: center;
                }
                .res-user {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 180px;
                }
                .avatar {
                    width: 32px; height: 32px;
                    background: #e0e7ff;
                    color: #4338ca;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 14px;
                }
                .user-text {
                    display: flex;
                    flex-direction: column;
                }
                .username { font-weight: 700; font-size: 14px; color: #1e293b; }
                .realname { font-size: 12px; color: #64748b; }

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

                .btn-cancel {
                    background: #fee2e2;
                    color: #ef4444;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-cancel:hover {
                    background: #fecaca;
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
                
                @media (max-width: 640px) {
                    .res-info { flex-direction: column; align-items: flex-start; gap: 8px; }
                    .res-user { width: auto; }
                    .res-time { flex-direction: column; gap: 4px; }
                    .reservation-item { align-items: flex-start; }
                    .res-action { align-self: center; margin-left: auto; }
                }
            `}</style>
        </main>
    );
}
