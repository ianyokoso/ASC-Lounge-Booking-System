"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/reservations");
            const data = await res.json();

            if (data.reservations && Array.isArray(data.reservations)) {
                setReservations(data.reservations);
            } else {
                setReservations([]);
                if (data.error) setError(data.error);
            }
        } catch (err) {
            setError("데이터를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("이 예약을 삭제하시겠습니까?")) return;

        try {
            const res = await fetch(`/api/admin/reservations?id=${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "삭제 실패");
            }

            fetchReservations();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <main className="container">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1>관리자 대시보드</h1>
                    <p className="text-gray-500">전체 예약 현황을 관리합니다.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
            ) : error ? (
                <div className="alert alert-error">{error}</div>
            ) : reservations.length === 0 ? (
                <div className="card text-center p-12 text-gray-500">
                    예약 내역이 없습니다.
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left bg-slate-50 border-b">
                                <th className="p-4">날짜</th>
                                <th className="p-4">시간</th>
                                <th className="p-4">예약자</th>
                                <th className="p-4">계정명</th>
                                <th className="p-4 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...reservations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((r) => (
                                <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="p-4">{r.date}</td>
                                    <td className="p-4">{r.timeSlot}</td>
                                    <td className="p-4 font-medium">{r.user?.name || "-"}</td>
                                    <td className="p-4 text-sm text-gray-500">{r.user?.username}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleDelete(r.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <style jsx>{`
                .container { max-width: 1000px; margin: 40px auto; padding: 20px; }
                .card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .overflow-hidden { overflow: hidden; }
                .w-full { width: 100%; border-collapse: collapse; }
                .mb-8 { margin-bottom: 32px; }
                .p-4 { padding: 16px; }
                .border-b { border-bottom: 1px solid #e2e8f0; }
                .bg-slate-50 { background-color: #f8fafc; }
                .font-medium { font-weight: 500; }
                .text-sm { font-size: 0.875rem; }
                .text-gray-500 { color: #64748b; }
                .text-blue-500 { color: #3b82f6; }
                .text-red-500 { color: #ef4444; }
                .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 16px; border-radius: 8px; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .gap-4 { gap: 16px; }
                .text-center { text-align: center; }
                .transition-colors { transition: background-color 0.2s, color 0.2s; }
                .rounded-full { border-radius: 9999px; }
                .rounded-lg { border-radius: 8px; }
            `}</style>
        </main>
    );
}
