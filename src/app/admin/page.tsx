"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

export default function AdminPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReservations = async () => {
        try {
            const res = await fetch("/api/reservations"); // Admin should ideally have a separate endpoint or reused one
            // Assuming /api/reservations returns all for now, we can filter or just show all
            const data = await res.json();
            setReservations(data);
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
            // Admin delete might need a different endpoint or special permission handling in the implementation
            // utilizing the same DELETE endpoint but ensuring the user is admin (or allowed)
            // For now using the same endpoint, assuming the current user is the owner or we bypass for admin
            // Wait, the current DELETE endpoint checks for ownership. 
            // I should create a separate admin endpoint or updated the DELETE endpoint to allow admins.
            // For simplicity in this iteration, I will create a specific admin API route.

            const res = await fetch(`/api/admin/reservations?id=${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("삭제 실패");
            }

            fetchReservations();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <main className="container">
            <h1>관리자 대시보드</h1>
            <p className="mb-8">전체 예약 현황을 관리합니다.</p>

            {loading ? (
                <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : error ? (
                <div className="alert alert-error">{error}</div>
            ) : (
                <div className="card">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="p-3">날짜</th>
                                <th className="p-3">시간</th>
                                <th className="p-3">예약자</th>
                                <th className="p-3">아이디</th>
                                <th className="p-3">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((r) => (
                                <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="p-3">{r.date}</td>
                                    <td className="p-3">{r.timeSlot}</td>
                                    <td className="p-3 font-medium">{r.user?.name || "-"}</td>
                                    <td className="p-3 text-sm text-gray-500">{r.user?.username}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleDelete(r.id)}
                                            className="text-red-500 hover:text-red-700 p-2"
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
                .card { background: white; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .w-full { width: 100%; border-collapse: collapse; }
                .mb-8 { margin-bottom: 32px; }
                .p-3 { padding: 12px; }
                .border-b { border-bottom: 1px solid #e2e8f0; }
                .font-medium { font-weight: 500; }
                .text-sm { font-size: 0.875rem; }
                .text-gray-500 { color: #64748b; }
                .text-red-500 { color: #ef4444; }
                .text-red-700:hover { color: #b91c1c; }
                .flex { display: flex; }
                .justify-center { justify-content: center; }
                .hover\:bg-slate-50:hover { background-color: #f8fafc; }
            `}</style>
        </main>
    );
}
